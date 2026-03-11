import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Alert } from "react-native";
import { rescheduleClassNotifications, setupNotifications } from "../services/notifications";
import { loadScheduleEntries, saveScheduleEntries } from "../services/storage";
import type { ScheduleEntry } from "../types/schedule";

type ScheduleContextValue = {
  entries: ScheduleEntry[];
  loading: boolean;
  updateEntry: (entry: ScheduleEntry) => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    let alive = true;

    const initialize = async () => {
      const loadedEntries = await loadScheduleEntries();
      const isGranted = await setupNotifications();
      setNotificationEnabled(isGranted);

      if (!isGranted) {
        Alert.alert("通知がオフです", "授業通知を使うには通知許可が必要です。");
      }

      if (!alive) {
        return;
      }

      setEntries(loadedEntries);
      setLoading(false);
      if (isGranted) {
        await rescheduleClassNotifications(loadedEntries);
      }
    };

    initialize();

    return () => {
      alive = false;
    };
  }, []);

  const updateEntry = useCallback(async (entry: ScheduleEntry) => {
    let nextEntries: ScheduleEntry[] = [];
    setEntries((prev) => {
      const withoutSlot = prev.filter(
        (item) => !(item.day === entry.day && item.period === entry.period)
      );

      nextEntries = entry.className ? [...withoutSlot, entry] : withoutSlot;
      return nextEntries;
    });

    await saveScheduleEntries(nextEntries);
    if (notificationEnabled) {
      await rescheduleClassNotifications(nextEntries);
    }
  }, [notificationEnabled]);

  const value = useMemo(
    () => ({
      entries,
      loading,
      updateEntry,
    }),
    [entries, loading, updateEntry]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used inside ScheduleProvider");
  }
  return context;
}

