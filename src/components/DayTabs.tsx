import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayLabel } from "../types/schedule";

export function DayTabs({
  days,
  selectedDay,
  onSelect,
}: {
  days: DayLabel[];
  selectedDay: DayLabel;
  onSelect: (day: DayLabel) => void;
}) {
  return (
    <View style={styles.container}>
      {days.map((day) => {
        const selected = day === selectedDay;
        return (
          <Pressable
            key={day}
            onPress={() => onSelect(day)}
            style={[styles.tab, selected && styles.selectedTab]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{day}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f7f2f5",
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: "#efdde5",
    marginBottom: 6,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  selectedTab: {
    backgroundColor: "#f3bfd7",
  },
  label: {
    color: "#3b3746",
    fontSize: 38,
    fontWeight: "600",
  },
  selectedLabel: {
    color: "#3b2f40",
  },
});

