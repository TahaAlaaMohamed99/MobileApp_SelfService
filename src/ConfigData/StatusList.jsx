// Maps status codes directly to a theme color token (useDesignSystem colors
// key), resolved by utils/statusColor.jsx — not static CSS classes like the
// web version's StatusList.json.
export default {
  WorkflowStatus: {
    '1': 'text',
    '12': 'text',
    '9': 'text',
    '2': 'warning',
    '3': 'success',
    '5': 'success',
    '7': 'success',
    '11': 'success',
    '4': 'error',
    '6': '',
    '8': '',
    '10': '',
    '13': '',
    '999': 'primary',
  },
  NoYes: {
    '2': 'success',
    '1': '',
  },
  IsActive: {
    '1': 'success',
    '2': 'error',
  },
  isPaid: {
    '2': 'success',
    '1': 'error',
  },
  Gender: {
    '1': 'success',
    '2': '',
  },
  CalenderDayStatus: {
    '1': 'primary',
    '2': '#ef4444',
    '3': '#06b6d4',
    '4': ''
  },
};
