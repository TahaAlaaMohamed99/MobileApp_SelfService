export function toDisplayText(text, fallback = '') {
  if (text == null || text === '') return fallback;
  return String(text);
}
export function toTitleCase(text) {
  if (!text) return text;
  return String(text)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}
