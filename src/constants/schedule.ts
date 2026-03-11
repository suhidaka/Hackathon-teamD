import type { DayLabel } from "../types/schedule";

export const WEEK_DAYS: DayLabel[] = ["月", "火", "水", "木", "金"];

export const DAY_TO_WEEKDAY_NUMBER: Record<DayLabel, number> = {
  月: 2,
  火: 3,
  水: 4,
  木: 5,
  金: 6,
};