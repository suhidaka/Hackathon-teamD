import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSchedule } from "../../src/context/ScheduleContext";
import { GIRL_MESSAGES, HOME_MESSAGES } from "../../src/constants/messages";
import type { DayLabel, ScheduleEntry } from "../../src/types/schedule";
import {
  getEffectiveSchoolWeekday,
  getNextClass,
  parseHHMMToMinutes,
} from "../../src/utils/schedule";
import { ConversationBox } from "../../src/components/ConversationBox";

const DAY_LABEL_BY_WEEKDAY: Partial<Record<number, DayLabel>> = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
};

function pickRandomMessage(pool: string[], previousMessage?: string) {
  if (!pool.length) {
    return "";
  }
  if (pool.length === 1) {
    return pool[0];
  }

  let selected = pool[Math.floor(Math.random() * pool.length)];
  if (selected === previousMessage) {
    const alternatives = pool.filter((item) => item !== previousMessage);
    selected = alternatives[Math.floor(Math.random() * alternatives.length)];
  }
  return selected;
}

function getTodayClasses(entries: ScheduleEntry[], now: Date) {
  const today = DAY_LABEL_BY_WEEKDAY[getEffectiveSchoolWeekday(now)];
  if (!today) {
    return [];
  }

  return entries
    .filter((entry) => entry.day === today && entry.className.trim())
    .map((entry) => {
      const start = parseHHMMToMinutes(entry.startTime);
      const end = parseHHMMToMinutes(entry.endTime);
      if (start === null || end === null || end <= start) {
        return null;
      }
      return { start, end };
    })
    .filter((entry): entry is { start: number; end: number } => entry !== null)
    .sort((a, b) => a.start - b.start);
}

function resolveHomeMessage(
  entries: ScheduleEntry[],
  now: Date,
  previousMessage?: string
) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayClasses = getTodayClasses(entries, now);

  const soonClass = todayClasses.find((item) => {
    const diff = item.start - nowMinutes;
    return diff > 0 && diff <= 5;
  });
  if (soonClass) {
    return pickRandomMessage(HOME_MESSAGES.beforeClass, previousMessage);
  }

  const endedClasses = todayClasses.filter(
    (item) => nowMinutes >= item.end && nowMinutes < item.end + 5
  );
  if (endedClasses.length > 0) {
    const latestEnded = endedClasses[endedClasses.length - 1];
    const hasNextClass = todayClasses.some((item) => item.start > latestEnded.end);
    return pickRandomMessage(
      hasNextClass ? HOME_MESSAGES.afterClassWithNext : HOME_MESSAGES.afterClassDone,
      previousMessage
    );
  }

  if (nowMinutes >= 4 * 60 && nowMinutes < 8 * 60) {
    return pickRandomMessage(HOME_MESSAGES.morning, previousMessage);
  }

  if (nowMinutes >= 18 * 60 || nowMinutes < 4 * 60) {
    return pickRandomMessage(HOME_MESSAGES.night, previousMessage);
  }

  return pickRandomMessage(GIRL_MESSAGES, previousMessage);
}

export default function HomeScreen() {
  const { entries } = useSchedule();
  const [message, setMessage] = useState(GIRL_MESSAGES[0]);
  const previousMessageRef = useRef<string | undefined>(undefined);

  const nextClass = useMemo(() => getNextClass(entries, new Date()), [entries]);

  useEffect(() => {
    const updateMessage = () => {
      const newMessage = resolveHomeMessage(entries, new Date(), previousMessageRef.current);
      previousMessageRef.current = newMessage;
      setMessage(newMessage);
    };

    updateMessage();
    const intervalId = setInterval(updateMessage, 30000);
    return () => clearInterval(intervalId);
  }, [entries]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="white" />
      <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/rouka.png")}
        style={styles.visualArea}
        imageStyle={styles.roukaBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.nextClassCard}>
          <Text style={styles.nextClassText}>
            {nextClass
              ? `Next: ${nextClass.className} ${nextClass.startTime}`
              : "Next: 今日の授業はありません"}
          </Text>
        </View>
        <Image
          source={require("../../assets/images/character-main.png")}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <ConversationBox
          name="美月"
          message={message}
          style={styles.conversation}
        />
      </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7eef2",
  },
  nextClassCard: {
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f9ebf0",
    borderWidth: 1,
    borderColor: "#f0d8e1",
    zIndex: 10,
  },
  nextClassText: {
    fontSize: 20,
    color: "#5a5961",
  },
  visualArea: {
    overflow: "hidden",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  roukaBackground: {
    resizeMode: "cover",
    transform: [{ scaleX: 1.6 }, { scaleY: 1.8 }, { translateX: 70 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 44, 83, 0.16)",
  },
  characterImage: {
    width: "190%",
    height: 940,
    marginTop: 260,
  },
  conversation: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 180,
  },
});
