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
      try {
        const loadedEntries = await loadScheduleEntries();
        const isGranted = await setupNotifications();
        setNotificationEnabled(isGranted);

        if (!alive) {
          return;
        }

        setEntries(loadedEntries);
        setLoading(false);

        if (!isGranted) {
          Alert.alert(
            "通知権限がオフです",
            "授業通知を使うには端末の通知権限をオンにしてください。"
          );
          return;
        }

        await rescheduleClassNotifications(loadedEntries);
      } catch (error) {
        console.warn("Failed to initialize schedule context", error);
        if (alive) {
          setLoading(false);
          Alert.alert(
            "初期化エラー",
            "時間割データまたは通知の初期化に失敗しました。"
          );
        }
      }
    };

    initialize();

    return () => {
      alive = false;
    };
  }, []);

  const updateEntry = useCallback(
    async (entry: ScheduleEntry) => {
      let nextEntries: ScheduleEntry[] = [];
      setEntries((prev) => {
        const withoutSlot = prev.filter(
          (item) => !(item.day === entry.day && item.period === entry.period)
        );
        nextEntries = entry.className ? [...withoutSlot, entry] : withoutSlot;
        return nextEntries;
      });

      try {
        await saveScheduleEntries(nextEntries);
      } catch (error) {
        console.warn("Failed to update schedule entry", error);
      }

      if (notificationEnabled) {
        try {
          await rescheduleClassNotifications(nextEntries);
        } catch (error) {
          console.warn("Failed to reschedule notifications", error);
        }
      }
    },
    [notificationEnabled]
  );

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
