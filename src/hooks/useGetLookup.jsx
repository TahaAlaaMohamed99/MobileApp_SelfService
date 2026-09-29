import { useSelector } from 'react-redux';
import { getApi } from '../services/Api';

/**
 * Custom hook to fetch lookup lists from the API and transform them into
 * CustomSelect-ready options: [{ label, value, isDisabled, ... }].
 */
const useGetLookup = () => {
  const currentLanguage = useSelector((state) => state.themeSlice.currentLanguage);
  const apiInstance = getApi();

  /**
   * Fetches a list of items from a given API endpoint and transforms them into a list
   * of objects with dynamic keys for label, value, and extra keys.
   *
   * @param {string} api - The API endpoint to fetch the list from.
   * @param {string} labelKey - The key to use for the label property.
   * @param {string} [extraLabelKey] - Optional key to concatenate with the label key.
   * @param {string} valueKey - The key to use for the value property.
   * @param {Function} setIsLoading - Function to update the loading state.
   * @param {Function} setList - Function to update the list state.
   * @param {string[]} [extraKeys] - Optional array of additional keys to include in the result.
   * @param {Array} [disabledList] - Optional list of { id } items whose matching options are disabled.
   * @param {boolean} [isLookupValue] - When true, skip appending `/GetLookup` to the api path.
   * @param {boolean} [isfullitem] - When true, spread the full source item into the result too.
   */
  const getLookup = async (
    api,
    labelKey,
    extraLabelKey = null,
    valueKey,
    setIsLoading,
    setList,
    extraKeys = [],
    disabledList = null,
    isLookupValue = false,
    isfullitem = false
  ) => {
    try {
      if (setIsLoading) setIsLoading(true);
      const response = await apiInstance.get(`${api}${isLookupValue ? '' : '/GetLookup'}`);
      const responseData = response?.data || response;

      const data = responseData.map((item) => {
        const mappedItem = {
          label:
            api === 'Dimension'
              ? item[currentLanguage === 'ar' ? 'arabicName' : 'englishName']
              : extraLabelKey
                ? `${item[labelKey]}-${item[extraLabelKey]}`
                : item[labelKey],
          value: item[valueKey],
          isDisabled: disabledList?.some((disabledItem) => disabledItem.id == item[valueKey]) || false,
          ...extraKeys?.reduce((acc, key) => {
            acc[key] = item[key];
            return acc;
          }, {}),
          ...(isfullitem ? item : {}),
        };
        return mappedItem;
      });

      setList(data);
    } catch (err) {
      setList([])

    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const getLookupFilterGrid = async (
    api,
    labelKey,
    valueKey,
    setList,
    sendkey,
    keyGetLookup = true,
    extraKeys = []
  ) => {
    try {
      const response = await apiInstance.get(`${api}${keyGetLookup ? '/GetLookup' : ''}`);
      const responseData = response?.data || response;

      const data = responseData.map((item) => ({
        label: api === 'Dimension' ? item[currentLanguage === 'ar' ? 'arabicName' : 'englishName'] : item[labelKey],
        value: item[valueKey],
        sendkey,
        ...extraKeys?.reduce((acc, key) => {
          acc[key] = item[key];
          return acc;
        }, {}),
      }));

      setList(data);
    } catch (err) {
      setList([])
    }
  };

  return { getLookup, getLookupFilterGrid };
};

export default useGetLookup;
