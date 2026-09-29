import { useMemo } from 'react';

/**
 * Given a list of objects, returns the item that matches the given value and label.
 * If the value and label are given, the function will return the item that matches both.
 * If only the value is given, the function will return the first item in the list that matches the value.
 * If neither value nor label is given, the function will return null.
 *
 * @param {array} list - The list of objects to search.
 * @param {string} value - The value to search for.
 * @param {string} label - The label to search for.
 * @param {string} extraLabel - The extra label to search for.
 * @returns {object|null} The selected item from the list, or null.
 */
export default function useGetSelected(
  list = null,
  value = null,
  label = null,
  extraLabel = null,
  extraValue = false,
) {
  const selected = useMemo(() => {
    if (list && list?.length > 0) {
      if (extraValue) {
        const matchedItem = list.find((item) => item?.value == value);
        return matchedItem || null;
      }

      if (value !== null) {
        const matchedItem = list.find((item) => item?.value == value);
        return matchedItem || null;
      }
      if (value != null && label != null) {
        return {
          label: extraLabel ? `${label}-${extraLabel}` : label,
          value: value,
        };
      }
    } else if (value != null || label != null) {
      return {
        label: extraLabel ? `${label}-${extraLabel}` : label,
        value: value,
      };
    }
    return null;
  }, [list, value, label, extraLabel]);

  return selected;
}
