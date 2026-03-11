export type DayLabel = "月" | "火" | "水" | "木" | "金";

export type ScheduleEntry = {
  id: string;
  day: DayLabel;
  period: number;
  className: string;
  startTime: string;
  endTime: string;
};

