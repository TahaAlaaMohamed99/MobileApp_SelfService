import { useCallback } from "react";
import { useDispatch } from "react-redux";
import Resources from "../resources.json";

import { getApi } from "../services/Api";
import { setResources } from "../store/resourcesSlice";
import MergeResources from "../utils/MergeResources";

export const useFetchTranslations = (setLoading) => {
  const dispatch = useDispatch();

  const fetchAndSetTranslations = useCallback(async () => {
    if (setLoading) setLoading(true);

    try {
      const apiInstance = getApi();
      const response = await apiInstance.get("/Translation/GetTranslationFile");
      const data = response?.data;

      if (response?.success && data?.translationData != null) {
        const merged = MergeResources(data?.translationData, Resources)
         dispatch(setResources(merged));
        return merged;
      } else {
        dispatch(setResources(Resources));
        return Resources;
      }
    } catch (error) {
      dispatch(setResources(Resources));
      return Resources;
    } finally {
      if (setLoading) setLoading(false);
    }
  }, [dispatch, setLoading]);

  return { refetch: fetchAndSetTranslations };
};

export default useFetchTranslations;
