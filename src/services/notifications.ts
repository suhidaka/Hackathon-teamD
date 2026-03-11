import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { DAY_TO_WEEKDAY_NUMBER } from "../constants/schedule";
import type { ScheduleEntry } from "../types/schedule";
import { parseHHMMToMinutes } from "../utils/schedule";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("class-reminders", {
      name: "授業通知",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return status === "granted";
}

export async function rescheduleClassNotifications(entries: ScheduleEntry[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const validEntries = entries.filter(
    (entry) =>
      entry.className.trim().length > 0 &&
      /^\d{2}:\d{2}$/.test(entry.startTime) &&
      /^\d{2}:\d{2}$/.test(entry.endTime)
  );

  for (const entry of validEntries) {
    const startMinutes = parseHHMMToMinutes(entry.startTime);
    const endMinutes = parseHHMMToMinutes(entry.endTime);
    const weekday = DAY_TO_WEEKDAY_NUMBER[entry.day];

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      continue;
    }

    // 授業開始5分前通知
    const beforeStart = Math.max(0, startMinutes - 5);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `もうすぐ ${entry.className}`,
        body: `${entry.day}${entry.period}限の5分前です。`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: Math.floor(beforeStart / 60),
        minute: beforeStart % 60,
        repeats: true,
        channelId: "class-reminders",
      },
    });

    // 授業の半分時点通知
    const halfMinutes = Math.floor((startMinutes + endMinutes) / 2);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${entry.className} が半分経過`,
        body: `後半もがんばってね。`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: Math.floor(halfMinutes / 60),
        minute: halfMinutes % 60,
        repeats: true,
        channelId: "class-reminders",
      },
    });
  }
}

