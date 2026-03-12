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
  const isUnregistered = !className;

  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        <Text style={styles.periodText} numberOfLines={1}>
          {period}限
        </Text>
        <View style={styles.detailArea}>
          <Text style={[styles.classText, isUnregistered && styles.unregisteredText]}>
            {className || "未登録"}
          </Text>
          <View style={styles.dottedDivider} />
          <View style={styles.timeWrap}>
            <Text style={styles.timeText}>{startTime || "--:--"}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.timeText}>{endTime || "--:--"}</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={onPressEdit} style={styles.editButton}>
        <Ionicons name="pencil" size={22} color="#b85886" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9c4d0",
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  periodText: {
    width: 46,
    flexShrink: 0,
    textAlign: "left",
    color: "#241f2d",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 22,
  },
  detailArea: {
    flex: 1,
    justifyContent: "flex-start",
    paddingRight: 6,
  },
  classText: {
    color: "#241f2d",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19,
  },
  unregisteredText: {
    fontSize: 14,
    lineHeight: 17,
  },
  dottedDivider: {
    marginTop: 1,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d5c4ce",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    backgroundColor: "#fff8fc",
    borderWidth: 1,
    borderColor: "#c9afbc",
    borderStyle: "dashed",
    borderRadius: 999,
    paddingVertical: 1,
    paddingHorizontal: 8,
    color: "#2f2938",
    fontSize: 12,
    minWidth: 50,
    textAlign: "center",
  },
  arrow: {
    color: "#5d5566",
    fontSize: 13,
  },
  editButton: {
    marginLeft: 10,
    marginTop: 1,
    borderRadius: 999,
    padding: 4,
  },
});

