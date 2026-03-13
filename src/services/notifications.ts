import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { HOME_MESSAGES } from "../constants/messages";
import { DAY_TO_WEEKDAY_NUMBER } from "../constants/schedule";
import type { ScheduleEntry } from "../types/schedule";
import { parseHHMMToMinutes } from "../utils/schedule";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

function pickRandomMessage(pool: string[]) {
  if (!pool.length) {
    return "";
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickEndReminderMessage(hasNextClass: boolean) {
  return pickRandomMessage(
    hasNextClass ? HOME_MESSAGES.afterClassWithNext : HOME_MESSAGES.afterClassDone
  );
}

async function scheduleSafely(
  request: Parameters<typeof Notifications.scheduleNotificationAsync>[0]
) {
  try {
    await Notifications.scheduleNotificationAsync(request);
  } catch (error) {
    console.warn("Failed to schedule notification", error);
  }
}

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("class-reminders", {
      name: "Class Reminders",
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
      /^\d{1,2}:\d{2}$/.test(entry.startTime) &&
      /^\d{1,2}:\d{2}$/.test(entry.endTime)
  );

  for (const entry of validEntries) {
    const startMinutes = parseHHMMToMinutes(entry.startTime);
    const endMinutes = parseHHMMToMinutes(entry.endTime);
    const weekday = DAY_TO_WEEKDAY_NUMBER[entry.day];

    if (
      startMinutes === null ||
      endMinutes === null ||
      endMinutes <= startMinutes ||
      !weekday
    ) {
      continue;
    }

    const beforeStart = Math.max(0, startMinutes - 5);
    await scheduleSafely({
      content: {
        title: `Starting soon: ${entry.className}`,
        body: `${entry.day} period ${entry.period} starts in 5 minutes.`,
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

    const beforeEnd = Math.max(0, endMinutes - 5);
    const hasNextClass = validEntries.some((candidate) => {
      if (candidate.day !== entry.day) {
        return false;
      }
      const candidateStart = parseHHMMToMinutes(candidate.startTime);
      return candidateStart !== null && candidateStart > endMinutes;
    });

    await scheduleSafely({
      content: {
        title: `${entry.className} ends in 5 minutes`,
        body: pickEndReminderMessage(hasNextClass),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: Math.floor(beforeEnd / 60),
        minute: beforeEnd % 60,
        repeats: true,
        channelId: "class-reminders",
      },
    });

    const halfMinutes = Math.floor((startMinutes + endMinutes) / 2);
    await scheduleSafely({
      content: {
        title: `${entry.className} is halfway done`,
        body: "Keep going.",
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
