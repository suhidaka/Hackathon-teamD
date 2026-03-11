import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMemo } from "react";
import { useSchedule } from "../../src/context/ScheduleContext";
import { GIRL_MESSAGES } from "../../src/constants/messages";
import { getNextClass } from "../../src/utils/schedule";
import { ConversationBox } from "../../src/components/ConversationBox";

export default function HomeScreen() {
  const { entries } = useSchedule();

  const randomMessage = useMemo(() => {
    const index = Math.floor(Math.random() * GIRL_MESSAGES.length);
    return GIRL_MESSAGES[index];
  }, []);

  const nextClass = useMemo(() => getNextClass(entries, new Date()), [entries]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nextClassCard}>
        <Text style={styles.nextClassText}>
          {nextClass
            ? `Next: ${nextClass.className} ${nextClass.startTime}`
            : "Next: 今日の授業はありません"}
        </Text>
      </View>

      <ImageBackground
        source={require("../../assets/images/rouka.png")}
        style={styles.visualArea}
        imageStyle={styles.roukaBackground}
      >
        <View style={styles.overlay} />
        <Image
          source={require("../../assets/images/character-main.png")}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <ConversationBox
          name="美月"
          message={randomMessage}
          style={styles.conversation}
        />
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 110,
    backgroundColor: "#f7eef2",
  },
  nextClassCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#f9ebf0",
    borderWidth: 1,
    borderColor: "#f0d8e1",
    marginBottom: 12,
  },
  nextClassText: {
    fontSize: 24,
    color: "#5a5961",
  },
  visualArea: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 620,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  roukaBackground: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 44, 83, 0.16)",
  },
  characterImage: {
    width: "86%",
    height: 560,
    marginTop: 36,
  },
  conversation: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 20,
  },
});