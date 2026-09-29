import StatusListDefaults from '../ConfigData/StatusList.jsx';

/**
 * Resolves the status color for a column/row pair: looks up the mapped
 * theme color token (column's own StatusList override, or the shared
 * StatusList.jsx default for that column's generallist) against the live
 * theme palette. Supports both theme tokens (e.g., 'error', 'success')
 * and hex colors (e.g., '#ef4444'). Falls back to the theme's neutral
 * `disabledText` when unmapped.
 */
export function getStatusColor(column, row, colors) {
  const map = column.StatusList || StatusListDefaults[column.generallist];
  const key = map?.[row[column.secondKey]];
  if (!key) return colors.disabledText;
  return colors[key] ?? key;
}
