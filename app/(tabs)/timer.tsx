import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Vibration,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { ConversationBox } from "../../src/components/ConversationBox";

// ⭐️ セリフ内容は一言一句、ご指定のものを厳守しています！
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
    "準備ができたらスタートを押してね。", "タイマーをセットしてね！"
  ]
};

export default function TimerScreen() {
  const [inputMinutes, setInputMinutes] = useState("60"); 
  const [initialTime, setInitialTime] = useState(3600);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [finishedTime, setFinishedTime] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false); 
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isVibrationOn, setIsVibrationOn] = useState(true);

  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [message, setMessage] = useState("準備ができたらスタートを押してね。");

  const lastUpdateRef = useRef(Date.now());
  const currentMessageRef = useRef(message);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.log("オーディオ設定エラー:", e);
      }
    };
    configureAudio();
  }, []);

  // ⭐️ 変更：ご指定の「66%」を基準に切り替えるようにしました
  const determineCategory = () => {
    if (isActive) {
      const ratio = timeLeft / initialTime;
      // 残り時間が66%より多ければ「開始(start)」
      if (ratio > 0.66) return "start"; 
      // 66%以下になったら「途中(during)」
      return "during";                 
    }
    if (finishedTime) return "end"; // タイマー終了時
    return "default";               // スタート前
  };

  const updateMessage = (forceUpdate = false) => {
    const newCategory = determineCategory();
    
    if (newCategory !== currentCategory || forceUpdate) {
      setCurrentCategory(newCategory);
      const messages = DIALOGUE[newCategory as keyof typeof DIALOGUE] || DIALOGUE.default;
      let randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      if (forceUpdate && messages.length > 1 && randomMsg === currentMessageRef.current) {
        const filtered = messages.filter(m => m !== currentMessageRef.current);
        randomMsg = filtered[Math.floor(Math.random() * filtered.length)];
      }

      setMessage(randomMsg);
      currentMessageRef.current = randomMsg;
      lastUpdateRef.current = Date.now();
    }
  };

  async function playAlarmAndVibrate() {
    if (isVibrationOn) {
      Vibration.vibrate([0, 500, 200, 500]);
    }

    if (isSoundOn) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../../assets/images/Clock-Alarm02-1(Loop).mp3') 
        );
        setSound(newSound);
        await newSound.playAsync();
      } catch (error) {
        console.log("音の再生エラー:", error);
      }
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    updateMessage();

    const interval = setInterval(() => {
      if (isActive && timeLeft > 0) {
        setTimeLeft((time) => time - 1);
      } else if (isActive && timeLeft === 0) {
        setIsActive(false);
        setFinishedTime(new Date());
        updateMessage(true); 
        playAlarmAndVibrate(); 
      }

      if (Date.now() - lastUpdateRef.current >= 3 * 60 * 1000) {
        updateMessage(true);
      } else {
        updateMessage(); 
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft, finishedTime, currentCategory, isSoundOn, isVibrationOn]);

  const finishEditing = () => {
    setIsEditing(false); 
    Keyboard.dismiss(); 
    
    const mins = parseInt(inputMinutes, 10);
    if (!mins || mins <= 0) {
      setInputMinutes("60");
      setInitialTime(3600);
      setTimeLeft(3600);
    } else {
      setInitialTime(mins * 60);
      setTimeLeft(mins * 60);
    }
  };

  const toggleTimer = () => {
    Keyboard.dismiss();
    setIsEditing(false); 

    let currentLeft = timeLeft;
    const mins = parseInt(inputMinutes, 10);
    
    if (!isActive && (!mins || mins <= 0)) {
      setInputMinutes("1");
      setInitialTime(60);
      setTimeLeft(60);
      currentLeft = 60;
    } else if (!isActive && timeLeft === initialTime) {
      setInitialTime(mins * 60);
      setTimeLeft(mins * 60);
      currentLeft = mins * 60;
    }

    if (!isActive && currentLeft > 0) {
      setFinishedTime(null);
      updateMessage(true);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsEditing(false); 
    Keyboard.dismiss();
    
    if (sound) {
      sound.stopAsync();
    }
    
    const mins = parseInt(inputMinutes, 10) || 60;
    setInitialTime(mins * 60);
    setTimeLeft(mins * 60);
    setFinishedTime(null);
    
    setCurrentCategory("default");
    const messages = DIALOGUE.default;
    let randomMsg = messages[Math.floor(Math.random() * messages.length)];
    if (messages.length > 1 && randomMsg === currentMessageRef.current) {
        const filtered = messages.filter(m => m !== currentMessageRef.current);
        randomMsg = filtered[Math.floor(Math.random() * filtered.length)];
    }
    setMessage(randomMsg);
    currentMessageRef.current = randomMsg;
    lastUpdateRef.current = Date.now();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => Keyboard.dismiss()}>
        
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
            onPress={() => updateMessage(true)}
            style={styles.conversationTouchArea}
          >
            <ConversationBox name="美月" message={message} />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.timerArea}>
          
          <View style={styles.feedbackSettings}>
            <TouchableOpacity onPress={() => setIsSoundOn(!isSoundOn)} style={styles.feedbackBtn}>
              <Ionicons name={isSoundOn ? "volume-high" : "volume-mute"} size={26} color={isSoundOn ? "#eb85af" : "#b0aeb3"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsVibrationOn(!isVibrationOn)} style={styles.feedbackBtn}>
              <Ionicons name={isVibrationOn ? "phone-portrait" : "phone-portrait-outline"} size={24} color={isVibrationOn ? "#eb85af" : "#b0aeb3"} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            {!isActive && timeLeft === initialTime ? (
              isEditing ? (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.timeInput}
                    value={inputMinutes}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, "");
                      setInputMinutes(numericValue);
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    autoFocus={true} 
                    selectTextOnFocus
                  />
                  <Text style={styles.timeUnit}>分</Text>
                  
                  <TouchableOpacity style={styles.decideButton} onPress={finishEditing}>
                    <Text style={styles.decideButtonText}>決定</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.inputWrapper} 
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timeInputDisplay}>{inputMinutes}</Text>
                  <Text style={styles.timeUnit}>分</Text>
                  
                  <View style={styles.editHintBadge}>
                    <Ionicons name="pencil" size={16} color="#eb85af" />
                  </View>
                </TouchableOpacity>
              )
            ) : (
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.resetButton} onPress={resetTimer} activeOpacity={0.6}>
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainButton, isActive ? styles.buttonActive : styles.buttonInactive]} onPress={toggleTimer} activeOpacity={0.8}>
              <Text style={styles.buttonText}>{isActive ? "ストップ" : "スタート"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7eef2" },
  visualArea: { flex: 1, overflow: "hidden", justifyContent: "center", alignItems: "center", position: "relative" },
  background: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(13, 44, 83, 0.16)" },
  characterImage: { width: "86%", height: 560, marginTop: 80 },
  conversationTouchArea: { position: "absolute", left: 10, right: 10, bottom: 20 },
  
  timerArea: {
    backgroundColor: "#fff6f9", 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    alignItems: "center", 
    paddingTop: 24, 
    paddingBottom: 110, 
    borderWidth: 2, 
    borderColor: "#f6c7da", 
    borderBottomWidth: 0,
    position: "relative",
  },

  feedbackSettings: {
    position: "absolute",
    top: 10,
    left: 15,
    flexDirection: "row",
    gap: 5,
    zIndex: 10,
  },
  feedbackBtn: { padding: 4 },

  timeRow: { height: 90, justifyContent: "center", marginBottom: 8 },
  
  inputWrapper: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", position: "relative" },
  timeInput: { fontSize: 64, fontWeight: "700", color: "#5a5961", borderBottomWidth: 3, borderColor: "#f6c7da", minWidth: 100, textAlign: "center", paddingBottom: 0 },
  timeInputDisplay: { fontSize: 64, fontWeight: "700", color: "#5a5961", minWidth: 100, textAlign: "center", borderBottomWidth: 3, borderColor: "#f6c7da" },
  timeUnit: { fontSize: 32, fontWeight: "700", color: "#5a5961", marginLeft: 8 },
  decideButton: { marginLeft: 16, backgroundColor: "#eb85af", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, transform: [{ translateY: -12 }] },
  decideButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  editHintBadge: { position: "absolute", right: -24, top: 10, backgroundColor: "#fff6f9", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: "#f6c7da" },
  
  timeText: { fontSize: 64, fontWeight: "700", color: "#5a5961", width: 210, textAlign: "center", letterSpacing: 2 },
  buttonRow: { flexDirection: "row", width: "70%", justifyContent: "space-between" },
  resetButton: { width: "45%", paddingVertical: 14, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#f6c7da" },
  resetButtonText: { fontSize: 18, fontWeight: "bold", color: "#e09ab7" },
  mainButton: { width: "45%", paddingVertical: 14, borderRadius: 30, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonInactive: { backgroundColor: "#f6c7da" },
  buttonActive: { backgroundColor: "#eb85af" },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
});