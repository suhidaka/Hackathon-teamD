import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ScheduleEntry } from "../types/schedule";

export function EditClassModal({
  visible,
  day,
  period,
  initialValue,
  onClose,
  onSave,
}: {
  visible: boolean;
  day: string;
  period: number;
  initialValue?: ScheduleEntry;
  onClose: () => void;
  onSave: (value: {
    className: string;
    startTime: string;
    endTime: string;
  }) => void;
}) {
  const [className, setClassName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");

  useEffect(() => {
    setClassName(initialValue?.className ?? "");
    setStartTime(initialValue?.startTime ?? "09:00");
    setEndTime(initialValue?.endTime ?? "10:30");
  }, [initialValue, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {day} {period}限の編集
          </Text>

          <TextInput
            value={className}
            onChangeText={setClassName}
            placeholder="授業名 (空欄で削除)"
            style={styles.input}
          />

          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            placeholder="開始時間 例) 09:00"
            style={styles.input}
          />

          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            placeholder="終了時間 例) 10:30"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Pressable onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>

            <Pressable
              onPress={() => onSave({ className, startTime, endTime })}
              style={[styles.button, styles.saveButton]}
            >
              <Text style={styles.saveText}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(56, 48, 56, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#fff9fb",
    borderWidth: 1,
    borderColor: "#f0d8e4",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f4552",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8d0db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#2f2a37",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: "#ece8ec",
  },
  saveButton: {
    backgroundColor: "#ef8eb8",
  },
  cancelText: {
    color: "#5c5664",
    fontWeight: "600",
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});