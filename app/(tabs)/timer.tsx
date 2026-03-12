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

// タイマー専用のセリフ集
const DIALOGUE = {
  start: [
    "勉強タイムスタート！", "一緒に集中しよっか。", "よし、勉強モード！", "集中の時間だよ。",
    "今日も少しずつ進めていこ。", "今が頑張りどころだよ！", "一緒に勉強頑張ろうね。",
    "よし、始めよっか！", "小さな積み重ねが大事だよ。", "集中していこう！"
  ],
  during: [
    "順調そうだね！", "いい感じだよ！", "この調子！", "ちゃんと頑張ってるね。",
    "集中できてるね！", "少しずつ進んでるよ。", "そのまま頑張ろ！", "いいペースだね。",
    "もう少しだよ！", "ファイト！"
  ],
  end: [
    "お疲れさま！よく頑張ったね。", "今日も勉強えらい！", "ちゃんとやりきったね。",
    "頑張ったご褒美に少し休も。", "今日の勉強タイム終了！", "成長してるよ！",
    "よく頑張りました！", "お疲れさま！", "今日も一歩前進だね。", "ゆっくり休んでね。"
  ],
  default: [
    // タイマーをスタートする前の待機中のセリフ
    "準備ができたらスタートを押してね。", "タイマーをセットしてね！"
  ]
};

export default function TimerScreen() {
  const INITIAL_TIME = 3600; // 60分
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [finishedTime, setFinishedTime] = useState<Date | null>(null);
  
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [message, setMessage] = useState("一緒に集中しよっか！");

  const lastUpdateRef = useRef(Date.now());
  const currentMessageRef = useRef(message);

  // タイマーの状況に合わせてカテゴリーを決定
  const determineCategory = () => {
    if (isActive) {
      const elapsedSeconds = INITIAL_TIME - timeLeft;
      // 15分（900秒）までは開始時、それ以降は途中
      if (elapsedSeconds <= 15 * 60) return "start";
      return "during";
    }
    if (finishedTime) {
      // 終わった後は「終わり」のセリフ
      return "end";
    }
    // スタート前
    return "default";
  };

  // セリフを更新する処理
  const updateMessage = (forceUpdate = false) => {
    const newCategory = determineCategory();
    
    if (newCategory !== currentCategory || forceUpdate) {
      setCurrentCategory(newCategory);
      const messages = DIALOGUE[newCategory as keyof typeof DIALOGUE] || DIALOGUE.default;
      let randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      // 同じセリフが連続で出ないようにする
      if (forceUpdate && messages.length > 1 && randomMsg === currentMessageRef.current) {
        const filtered = messages.filter(m => m !== currentMessageRef.current);
        randomMsg = filtered[Math.floor(Math.random() * filtered.length)];
      }

      setMessage(randomMsg);
      currentMessageRef.current = randomMsg;
      lastUpdateRef.current = Date.now();
    }
  };

  useEffect(() => {
    updateMessage();

    const interval = setInterval(() => {
      if (isActive && timeLeft > 0) {
        setTimeLeft((time) => time - 1);
      } else if (isActive && timeLeft === 0) {
        setIsActive(false);
        setFinishedTime(new Date());
        updateMessage(true); 
      }

      // 3分（180秒）経過したらセリフを強制更新
      if (Date.now() - lastUpdateRef.current >= 3 * 60 * 1000) {
        updateMessage(true);
      } else {
        updateMessage(); 
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, finishedTime, currentCategory]);

  const toggleTimer = () => {
    if (!isActive && timeLeft > 0) {
      setFinishedTime(null);
      updateMessage(true);
    } else if (isActive) {
      // ストップを押した時に待機状態に戻したい場合はコメントアウトを外す
      // setFinishedTime(null); 
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
        
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => updateMessage(true)} // タップでセリフ切り替え
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
  conversationTouchArea: { position: "absolute", left: 10, right: 10, bottom: 20 },
  timerArea: {
    height: 340, // エリアの高さを広げる
    backgroundColor: "#fff6f9", 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    alignItems: "center", 
    paddingTop: 32, 
    paddingBottom: 150, // ボタンを上に持ち上げる（調整可能）
    borderWidth: 2, 
    borderColor: "#f6c7da", 
    borderBottomWidth: 0,
  },
  timeText: { fontSize: 64, fontWeight: "700", color: "#5a5961", marginBottom: 24, letterSpacing: 2 },
  button: { width: "60%", paddingVertical: 16, borderRadius: 30, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonInactive: { backgroundColor: "#f6c7da" },
  buttonActive: { backgroundColor: "#eb85af" },
  buttonText: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
});