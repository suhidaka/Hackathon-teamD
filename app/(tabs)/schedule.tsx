import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { DayTabs } from "../../src/components/DayTabs";
import { EditClassModal } from "../../src/components/EditClassModal";
import { PeriodCard } from "../../src/components/PeriodCard";
import { WEEK_DAYS } from "../../src/constants/schedule";
import { useSchedule } from "../../src/context/ScheduleContext";
import type { DayLabel, ScheduleEntry } from "../../src/types/schedule";
import { getEntryForSlot } from "../../src/utils/schedule";

const periods = [1, 2, 3, 4, 5, 6];

export default function ScheduleScreen() {
  const { entries, updateEntry } = useSchedule();
  const [selectedDay, setSelectedDay] = useState<DayLabel>("月");
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);

  const editingEntry = useMemo(() => {
    if (!editingPeriod) {
      return undefined;
    }
    return getEntryForSlot(entries, selectedDay, editingPeriod);
  }, [editingPeriod, entries, selectedDay]);

  const onSave = async (payload: {
    className: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!editingPeriod) {
      return;
    }

    const baseEntry: ScheduleEntry = {
      id: `${selectedDay}-${editingPeriod}`,
      day: selectedDay,
      period: editingPeriod,
      className: payload.className.trim(),
      startTime: payload.startTime.trim(),
      endTime: payload.endTime.trim(),
    };

    await updateEntry(baseEntry);
    setEditingPeriod(null);
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require("../../assets/images/character-main.png")}
        style={styles.sideCharacter}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardArea}>
          <DayTabs
            days={WEEK_DAYS}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />

          {periods.map((period) => {
            const item = getEntryForSlot(entries, selectedDay, period);
            return (
              <PeriodCard
                key={`${selectedDay}-${period}`}
                period={period}
                className={item?.className}
                startTime={item?.startTime}
                endTime={item?.endTime}
                onPressEdit={() => setEditingPeriod(period)}
              />
            );
          })}
        </View>
      </ScrollView>

      <EditClassModal
        visible={editingPeriod !== null}
        day={selectedDay}
        period={editingPeriod ?? 1}
        initialValue={editingEntry}
        onClose={() => setEditingPeriod(null)}
        onSave={onSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7eef2",
  },
  sideCharacter: {
    position: "absolute",
    left: -120,
    bottom: 40,
    width: 350,
    height: 650,
    opacity: 0.9,
  },
  content: {
    paddingTop: 84,
    paddingBottom: 110,
    paddingHorizontal: 14,
  },
  cardArea: {
    marginLeft: 76,
    gap: 10,
  },
});