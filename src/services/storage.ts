import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScheduleEntry } from "../types/schedule";

const STORAGE_KEY = "campus_kanojo_schedule_v1";

export async function loadScheduleEntries() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as ScheduleEntry[];
  }

  try {
    return JSON.parse(raw) as ScheduleEntry[];
  } catch {
    return [] as ScheduleEntry[];
  }
}

export async function saveScheduleEntries(entries: ScheduleEntry[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

