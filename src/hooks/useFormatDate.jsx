import dayjs from "dayjs";
import "dayjs/locale/ar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable required plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// React Native has no synchronous storage (AsyncStorage is async-only), so unlike
// the web version this can't read a Configuration timezone override at module load.
const DEFAULT_TIMEZONE = "Africa/Cairo";
const offset = (date) => dayjs(date).tz(DEFAULT_TIMEZONE).utcOffset();

export const useFormatDate = (
  date,
  currentLanguage = "en",
  includeTime = false,
) => {
  if (!date) return "";

  const formattedDate = dayjs(date);

  const dateFormat = currentLanguage === "ar" ? "YYYY/MM/DD" : "DD/MM/YYYY";

  const dateTimeFormat =
    currentLanguage === "ar" ? "YYYY/MM/DD HH:mm A" : "DD/MM/YYYY hh:mm A";

  return formattedDate.format(includeTime ? dateTimeFormat : dateFormat);
};
export const useFormatDateDaly = (date, currentLanguage = "en") => {
  if (!date) return "";

  return dayjs
    .utc(date)
    .locale(currentLanguage)
    .utcOffset(offset(date))
    .tz(DEFAULT_TIMEZONE)
    .format("DD MMM YYYY - hh:mm A");
};
export const useFormatNotificationDate = (date, currentLanguage = "en") => {
  if (!date) return "";

  const target = dayjs.utc(date).utcOffset(offset(date)).tz(DEFAULT_TIMEZONE);
  const now = dayjs().tz(DEFAULT_TIMEZONE);
  const isAr = currentLanguage === "ar";

  const time = target.locale(currentLanguage).format("hh:mm A");

  const dayDiff = now.startOf("day").diff(target.startOf("day"), "day");

  if (dayDiff <= 0) return time;

  if (dayDiff === 1) {
    return isAr ? `أمس، ${time}` : `Yesterday, ${time}`;
  }

  if (dayDiff <= 30) {
    return isAr ? `منذ ${dayDiff} يوم، ${time}` : `${dayDiff} days ago, ${time}`;
  }

  const monthDiff = Math.max(now.diff(target, "month"), 1);
  if (monthDiff < 12) {
    const label = isAr
      ? `${monthDiff === 1 ? "شهر" : `${monthDiff} شهر`}`
      : `${monthDiff} ${monthDiff === 1 ? "month" : "months"}`;
    return isAr ? `منذ ${label}، ${time}` : `${label} ago, ${time}`;
  }

  const yearDiff = Math.max(now.diff(target, "year"), 1);
  const yearLabel = isAr
    ? `${yearDiff === 1 ? "سنة" : `${yearDiff} سنة`}`
    : `${yearDiff} ${yearDiff === 1 ? "year" : "years"}`;
  return isAr ? `منذ ${yearLabel}، ${time}` : `${yearLabel} ago, ${time}`;
};
export const parseAPIDate = (dateString) => {
  if (!dateString) return null;
  return dayjs(dateString).toDate();
};
export const formatDateForAPI = (date) => {
  if (!date) return null;
  return dayjs(date).format("YYYY-MM-DDTHH:mm");
};
export const formatDateOnlyForAPI = (date) => {
  if (!date) return null;
  return dayjs(date).format("YYYY-MM-DD");
};
export const getCurrentDate = () => {
  return dayjs().tz(DEFAULT_TIMEZONE).toDate();
};

// Plain time-only helpers (no timezone conversion) — used where only the clock
// time/period of a value is needed, independent of DEFAULT_TIMEZONE.
export const toZoned = (value) => dayjs(value);
export const formatTimeShort = (value) => dayjs(value).format("hh:mm");
export const formatDayMonth = (value) => dayjs(value).format("DD/MM");
export const formatPeriod = (value) => dayjs(value).format("A");
export const formatTimeAndPeriod = (value) => ({
  time:value? formatTimeShort(value) : "00:00",
  period:value? formatPeriod(value) :"--",
});
export const formatDateMonthShort = (value, locale = "en") =>
  dayjs(value).locale(locale).format("DD MMM");

export const useFormatDateMonthShort = (currentLanguage) => {
  return (value) => formatDateMonthShort(value, currentLanguage);
};
export const formatWeekday = (value, currentLanguage = "en") =>
  dayjs(value).locale(currentLanguage).format("dddd");
export const formatMonthName = (year, month, locale = "en") => {
  if (!year || !month) return "";
  const dateString = `${year}-${String(month).padStart(2, "0")}-01`;
  return dayjs(dateString).locale(locale).format("MMMM");
};
export const formatMonthYearName = (year, month, locale = "en") => {
  if (!year || !month) return "";
  const dateString = `${year}-${String(month).padStart(2, "0")}-01`;
  return dayjs(dateString).locale(locale).format("MMMM YYYY");
};

export const useFormatMonthName = (currentLanguage) => {
  return (year, month) => formatMonthName(year, month, currentLanguage);
};

export const formatMonthYearShort = (year, month, locale = "en") => {
  if (!year || !month) return "";
  const dateString = `${year}-${String(month).padStart(2, "0")}-01`;
  return dayjs(dateString).locale(locale).format("MMM YYYY");
};

export const useFormatMonthYearName = (currentLanguage) => {
  return (year, month) => formatMonthYearName(year, month, currentLanguage);
};

export const useFormatMonthYearShort = (currentLanguage) => {
  return (year, month) => formatMonthYearShort(year, month, currentLanguage);
};

export function formatSecondsToHHMMSS(totalSeconds) {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);

  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return isNegative ? `-${formatted}` : formatted;
}

export const formatTimeWithPeriod = (timeString) => {
  if (!timeString) return null;
  const time = dayjs(`2000-01-01 ${timeString}`, "YYYY-MM-DD HH:mm");
  return {
    time: time.format("hh:mm"),
    period: time.format("A"),
  };
};