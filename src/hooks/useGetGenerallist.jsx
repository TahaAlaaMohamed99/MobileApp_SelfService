import Generallists from '../ConfigData/Generallist.json';
import { store } from '../store';
import Resources from '../resources.json';
/**
 * Custom hook to fetch and transform Generallist.json entries into
 * CustomSelect-ready options: [{ label, value, isDisabled }].
 */
const useGetGenerallist = () => {
  /**
   * @param {string} NameGenerallist - The key in `Generallist.json` representing the list to fetch.
   * @param {Function} setIsLoading - Function to update the loading state.
   * @param {Function} setList - Function to update the transformed list of data.
   * @param {boolean} PageName - Whether to use page-based translation or general list translation.
   * @param {boolean|string} extrValue - Item key to include as `extrValueOperand` in the returned data.
   * @param {boolean} isFilterGrid - Whether to include the original key for filtering purposes.
   */
  const getGenerallist = async (
    NameGenerallist,
    setIsLoading,
    setList,
    PageName = false,
    extrValue = false,
    isFilterGrid = false
  ) => {
    try {
      if (setIsLoading) setIsLoading(true);

      const currentLanguage = store.getState().themeSlice.currentLanguage;
      const ReduxResources = store.getState().resourcesSlice.ReduxResources;
      const response = Generallists[NameGenerallist] || [];

      const getLabel = (item) => {
        const resources = [ReduxResources, Resources];
        for (const res of resources) {
          let value;
          if (PageName) {
            value = res?.[item.label]?.title?.[currentLanguage];
          } else {
            value = res?.Generallist?.[NameGenerallist]?.values?.[item.label]?.[currentLanguage];
          }
          if (value) return value;
        }
        return item.label;
      };

      const data = response.map((item) => {
        const label = getLabel(item);

        return {
          label,
          value: item.value,
          ...(extrValue ? { extrValueOperand: item[extrValue] } : {}),
          isDisabled: item.isDisabled || false,
          ...(isFilterGrid ? { sendKey: NameGenerallist } : {}),
        };
      });

      setList(data);
    } catch (error) {
      console.error('Error in getGenerallist:', error);
      setList([]);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  /**
   * Fetch multiple generallists at once.
   *
   * @param {Array} lists - Array of objects: { name, setList, PageName, extrValue, isFilterGrid }
   * @param {Function} setIsLoading - Function to set global loading status.
   */
  const getMultipleGenerallists = async (lists, setIsLoading) => {
    try {
      if (setIsLoading) setIsLoading(true);

      await Promise.all(
        lists.map(({ name, setList, PageName = false, extrValue = false, isFilterGrid = false }) =>
          getGenerallist(name, () => {}, setList, PageName, extrValue, isFilterGrid)
        )
      );
    } catch (error) {
      console.error('Error in getMultipleGenerallists:', error);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return { getGenerallist, getMultipleGenerallists };
};

export default useGetGenerallist;
