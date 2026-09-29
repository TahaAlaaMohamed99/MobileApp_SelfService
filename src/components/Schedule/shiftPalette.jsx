import { IconSun, IconSunset, IconMoon } from "../../assets/IconsSvg";

export const SHIFT_PASTELS = ["#E0D4F7", "#F9D6E0", "#D2F2E4", "#FCEAC0", "#D8E0FB", "#FDE2C8"];

export const getShiftColor = (index) => SHIFT_PASTELS[index % SHIFT_PASTELS.length];

export const SHIFT_DEFINITIONS = {
  morning: { key: "morning", recIdKey: "morningRecId", timeKey: "morningTime", Icon: IconSun, bg: "#FCEAC0", fg: "#9A6B00" },
  evening: { key: "evening", recIdKey: "eveningRecId", timeKey: "eveningTime", Icon: IconSunset, bg: "#FCDFC4", fg: "#B5530A" },
  night: { key: "night", recIdKey: "nightRecId", timeKey: "nightTime", Icon: IconMoon, bg: "#DCE6FB", fg: "#1E50C8" },
};

export const getDayShifts = (dayData) =>
  Object.values(SHIFT_DEFINITIONS)
    .filter((shift) => dayData?.[shift.recIdKey] > 0)
    .map((shift) => ({ ...shift, time: dayData?.[shift.timeKey], ...dayData }));

export const formatShiftTimeRange = (time, isRTL) =>
  `${time?.timeFrom ?? ""} ${isRTL ? "إلى" : "to"} ${time?.timeTo ?? ""}`;

export const STATUS_COLORS = {
  weekend: "#06b6d4",
  holiday: "#ef4444",
  vacation: "#f97316",
  exception: "#494C6E",
  partialLeave: "#6366f1",
  mission: "#3b82f6",
  WorkPartTime: "#a855f7",
  ExtraWorkWeekend: "#ec4899",
  ExtraWorkHoliday: "#f43f5e",
};
export const STATUS_COLOR_LIST = [
  { type: "weekend", title: "weekend", page: "General" },
  { type: "holiday", title: "holiday", page: "General" },
  { type: "vacation", title: "Vacation", page: "General" },
  { type: "exception", title: "title", page: "AttendanceException" },
  { type: "partialLeave", title: "title", page: "PartialDayLeave" },
  { type: "mission", title: "title", page: "Mission" },
  { type: "WorkPartTime", title: "title", page: "WorkPartTime" },
  { type: "ExtraWorkWeekend", title: "title", page: "ExtraWorkWeekend" },
  { type: "ExtraWorkHoliday", title: "title", page: "ExtraWorkHoliday" },
];
export const getStatusColor = (type) => STATUS_COLORS[type] || "";
