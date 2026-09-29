import { getApi } from '../services/Api';
import useToast from './useToast';

const useGetData = (api, setIsLoading, setData, prevRoute) => {
  const toast = useToast();
  const apiInstance = getApi();
  const fetchData = async (queryParams = '') => {
    if (setIsLoading) setIsLoading(true);
    try {
      const response = await apiInstance.get(`${api}${queryParams}`);
      if (setData) setData(response?.data || response);
      if (setIsLoading) setIsLoading(false);
    } catch (err) {
      toast.error('notFound', null, 'GeneralMessages');
      if (setIsLoading) setIsLoading(false);
    }
  };

  return fetchData;
};

export default useGetData;
