export default function useFormatNumber(value) {
  if (value == null || value === '') return value;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
