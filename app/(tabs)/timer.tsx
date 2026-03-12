import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { ConversationBox } from "../../src/components/ConversationBox";
import { useSchedule } from "../../src/context/ScheduleContext";

// セリフ全集（変更なし）
const DIALOGUE = {
  morning: [
    "おはよう！今日も一日頑張ろうね", "おはよ〜！ちゃんと起きれた？", "おはよう、いい朝だね。",
    "今日も授業あるよ！準備はOK？", "朝だよ〜！寝坊してない？", "今日も学生生活、楽しんでいこ！",
    "おはよう！今日も一緒に頑張ろうね。", "眠そうだね…でも今日もファイト！", "朝ごはんちゃんと食べた？", "新しい一日が始まるよ！"
  ],
  beforeClass1Hour: [
    "もうすぐ授業だよ！遅れないようにね。", "そろそろ次の授業の時間だね。", "準備できてる？授業始まるよ。",
    "急がないと授業始まっちゃうよ！", "次の授業の時間だよ〜。", "教室ちゃんと分かる？",
    "そろそろ移動しよっか。", "間に合いそう？急ごう！", "授業前の準備、忘れてない？", "今日の授業も頑張ろう！"
  ],
  beforeClass15Min: [
    "もうすぐ始まるよ！席につこう。", "授業始まるよ〜！", "先生来る前に準備しとこ！",
    "ノートの準備OK？", "今日の授業、ちゃんと聞こうね。", "もうすぐ始まるね。",
    "集中していこう！", "授業の時間だよ！", "よし、頑張ろう！", "今日もちゃんと勉強しよ！"
  ],
  afterClassHasNext: [
    "お疲れさま！次の授業まで少し休憩だね。", "授業終わったね、次の準備しよっか。",
    "あともう一コマだね！", "まだ授業あるけど頑張ろう！", "次の授業もファイト！"
  ],
  afterClassAllDone: [
    "今日の授業全部終わったね！お疲れさま。", "今日も学校よく頑張ったね。", "今日はもうゆっくりしていいよ。",
    "今日もちゃんと通えたね、えらい。", "帰ったらゆっくり休もうね。"
  ],
  timerStart: [
    "勉強タイムスタート！", "一緒に集中しよっか。", "よし、勉強モード！", "集中の時間だよ。",
    "今日も少しずつ進めていこ。", "今が頑張りどころだよ！", "一緒に勉強頑張ろうね。",
    "よし、始めよっか！", "小さな積み重ねが大事だよ。", "集中していこう！"
  ],
  timerDuring: [
    "順調そうだね！", "いい感じだよ！", "この調子！", "ちゃんと頑張ってるね。",
    "集中できてるね！", "少しずつ進んでるよ。", "そのまま頑張ろ！", "いいペースだね。",
    "もう少しだよ！", "ファイト！"
  ],
  timerEnd: [
    "お疲れさま！よく頑張ったね。", "今日も勉強えらい！", "ちゃんとやりきったね。",
    "頑張ったご褒美に少し休も。", "今日の勉強タイム終了！", "成長してるよ！",
    "よく頑張りました！", "お疲れさま！", "今日も一歩前進だね。", "ゆっくり休んでね。"
  ],
  night: [
    "今日も一日お疲れさま。", "今日も頑張ったね。", "ゆっくり休んでね。", "明日も一緒に頑張ろ。",
    "夜更かししすぎないようにね。", "ちゃんと休むのも大事だよ。", "今日もお疲れさま！",
    "また明日ね。", "おやすみ。", "いい夢見てね。"
  ],
  default: [
    "自分のペースで進めていこうね。", "ちょっと休憩するのも大事だよ。", "今日も一緒に頑張ろう！"
  ]
};

export default function TimerScreen() {
  const { entries } = useSchedule();
  
  const INITIAL_TIME = 3600; // 60分
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [finishedTime, setFinishedTime] = useState<Date | null>(null);
  
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [message, setMessage] = useState("今日も一緒に頑張ろう！");

  // 【追加】3分ごとの更新や連続被りを防ぐための記録（Ref）
  const lastUpdateRef = useRef(Date.now());
  const currentMessageRef = useRef(message);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return new Date();
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const determineCategory = () => {
    const now = new Date();

    if (isActive) {
      const elapsedSeconds = INITIAL_TIME - timeLeft;
      if (elapsedSeconds <= 15 * 60) return "timerStart";
      return "timerDuring";
    }
    if (finishedTime) {
      const diffMinutes = (now.getTime() - finishedTime.getTime()) / (1000 * 60);
      if (diffMinutes <= 30) return "timerEnd";
    }

    const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
    const todayLabel = dayLabels[now.getDay()];
    const todaysEntries = entries
      .filter((e) => e.day === todayLabel && e.startTime && e.endTime)
      .sort((a, b) => parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime());

    for (let i = 0; i < todaysEntries.length; i++) {
      const entry = todaysEntries[i];
      const start = parseTime(entry.startTime);
      const end = parseTime(entry.endTime);
      const diffToStart = (start.getTime() - now.getTime()) / (1000 * 60);
      const diffFromEnd = (now.getTime() - end.getTime()) / (1000 * 60);

      if (diffToStart > 15 && diffToStart <= 60) return "beforeClass1Hour";
      if (diffToStart > 0 && diffToStart <= 15) return "beforeClass15Min";

      if (diffFromEnd > 0 && diffFromEnd <= 60) {
        const hasNext = i + 1 < todaysEntries.length;
        return hasNext ? "afterClassHasNext" : "afterClassAllDone";
      }
    }

    const hour = now.getHours();
    if (hour >= 5 && hour < 8) return "morning";
    if (hour >= 19 || hour < 1) return "night";

    return "default";
  };

  // セリフを更新する処理
  const updateMessage = (forceUpdate = false) => {
    const newCategory = determineCategory();
    
    // カテゴリーが変わった時、または強制更新（タップや3分経過）の時
    if (newCategory !== currentCategory || forceUpdate) {
      setCurrentCategory(newCategory);
      const messages = DIALOGUE[newCategory as keyof typeof DIALOGUE] || DIALOGUE.default;
      let randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      // 【追加】タップ時などに、直前と全く同じセリフが出ないようにする工夫
      if (forceUpdate && messages.length > 1 && randomMsg === currentMessageRef.current) {
        const filtered = messages.filter(m => m !== currentMessageRef.current);
        randomMsg = filtered[Math.floor(Math.random() * filtered.length)];
      }

      setMessage(randomMsg);
      currentMessageRef.current = randomMsg; // 現在のセリフを記録
      lastUpdateRef.current = Date.now();    // 更新時間をリセット
    }
  };

  useEffect(() => {
    updateMessage();

    const interval = setInterval(() => {
      // 1. タイマーのカウントダウン処理
      if (isActive && timeLeft > 0) {
        setTimeLeft((time) => time - 1);
      } else if (isActive && timeLeft === 0) {
        setIsActive(false);
        setFinishedTime(new Date());
        updateMessage(true); 
      }

      // 2. 【追加】3分（180秒 = 180,000ミリ秒）経過したらセリフを強制更新
      if (Date.now() - lastUpdateRef.current >= 3 * 60 * 1000) {
        updateMessage(true);
      } else {
        updateMessage(); // 通常の状況チェック
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, finishedTime, entries, currentCategory]);

  const toggleTimer = () => {
    if (!isActive && timeLeft > 0) {
      setFinishedTime(null);
      updateMessage(true);
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/rouka.png")}
        style={styles.visualArea}
        imageStyle={styles.background}
      >
        <View style={styles.overlay} />
        <Image
          source={require("../../assets/images/character-main.png")}
          style={styles.characterImage}
          resizeMode="contain"
        />
        
        {/* 【追加】タップできるエリアとしてラップ */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => updateMessage(true)} // タップで強制更新
          style={styles.conversationTouchArea}
        >
          <ConversationBox name="美月" message={message} />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.timerArea}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <TouchableOpacity
          style={[styles.button, isActive ? styles.buttonActive : styles.buttonInactive]}
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{isActive ? "ストップ" : "スタート"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7eef2" },
  visualArea: { flex: 1, overflow: "hidden", justifyContent: "center", alignItems: "center", position: "relative" },
  background: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(13, 44, 83, 0.16)" },
  characterImage: { width: "86%", height: 560, marginTop: 36 },
  
  // 【変更】ConversationBox自体のstyleから、タッチエリア用のstyleに名前と用途を変更
  conversationTouchArea: { position: "absolute", left: 10, right: 10, bottom: 20 },
  
  timerArea: {
    height: 280, backgroundColor: "#fff6f9", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    alignItems: "center", paddingTop: 32, paddingBottom: 140, borderWidth: 2, borderColor: "#f6c7da", borderBottomWidth: 0,
  },
  timeText: { fontSize: 64, fontWeight: "700", color: "#5a5961", marginBottom: 24, letterSpacing: 2 },
  button: { width: "60%", paddingVertical: 16, borderRadius: 30, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonInactive: { backgroundColor: "#f6c7da" },
  buttonActive: { backgroundColor: "#eb85af" },
  buttonText: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
});