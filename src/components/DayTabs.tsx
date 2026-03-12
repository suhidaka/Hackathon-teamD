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
    backgroundColor: "#f8f4f6",
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e6dbe2",
    marginBottom: 6,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  selectedTab: {
    backgroundColor: "#f3bfd7",
  },
  label: {
    color: "#5a4e58",
    fontSize: 18,
    fontWeight: "600",
  },
  selectedLabel: {
    color: "#4a2d3d",
  },
});

