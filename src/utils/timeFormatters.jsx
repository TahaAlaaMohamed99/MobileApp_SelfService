export function formatHours(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) {
    return "00:00";
  }

  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);

  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return isNegative ? `-${formatted}` : formatted;
}