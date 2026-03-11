import { WEEK_DAYS } from "../constants/schedule";
import type { DayLabel, ScheduleEntry } from "../types/schedule";

export function parseHHMMToMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

export function getEntryForSlot(
  entries: ScheduleEntry[],
  day: DayLabel,
  period: number
) {
  return entries.find((item) => item.day === day && item.period === period);
}

function dayToDateOffset(day: DayLabel, now: Date) {
  const dayIndex = WEEK_DAYS.indexOf(day) + 1; // Monday = 1
  const today = now.getDay() === 0 ? 7 : now.getDay();
  let offset = dayIndex - today;

  if (offset < 0) {
    offset += 7;
  }

  return offset;
}

export function getNextClass(entries: ScheduleEntry[], now: Date) {
  const candidates = entries
    .filter((item) => item.className.trim())
    .map((item) => {
      const offset = dayToDateOffset(item.day, now);
      const [hourStr, minuteStr] = item.startTime.split(":");
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + offset);
      startDate.setHours(Number(hourStr) || 0, Number(minuteStr) || 0, 0, 0);

      if (startDate < now) {
        startDate.setDate(startDate.getDate() + 7);
      }

      return {
        ...item,
        startDate,
      };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (!candidates.length) {
    return null;
  }

  return {
    className: candidates[0].className,
    startTime: candidates[0].startTime,
  };
}

