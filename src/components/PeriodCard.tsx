import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function PeriodCard({
  period,
  className,
  startTime,
  endTime,
  onPressEdit,
}: {
  period: number;
  className?: string;
  startTime?: string;
  endTime?: string;
  onPressEdit: () => void;
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.classText}>
          {period}限 {className || "未登録"}
        </Text>
        <View style={styles.timeWrap}>
          <Text style={styles.timeText}>{startTime || "--:--"}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.timeText}>{endTime || "--:--"}</Text>
        </View>
      </View>

      <Pressable onPress={onPressEdit} style={styles.editButton}>
        <Ionicons name="pencil" size={22} color="#ef8eb8" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#fbf9fb",
    borderWidth: 1,
    borderColor: "#ebdde4",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  classText: {
    color: "#363244",
    fontSize: 22,
    fontWeight: "700",
  },
  timeWrap: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#deced7",
    borderStyle: "dashed",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    color: "#3f3b47",
    fontSize: 14,
    minWidth: 68,
    textAlign: "center",
  },
  arrow: {
    color: "#73707d",
    fontSize: 16,
  },
  editButton: {
    marginLeft: 10,
    borderRadius: 999,
    padding: 4,
  },
});

