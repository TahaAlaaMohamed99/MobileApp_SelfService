import { router } from 'expo-router';
import { getApi } from '../services/Api';
import useToast from './useToast';

const useGetById = (api, id, setIsLoading, setData, prevRoute, ResourcePage, keyGetById = 'GetById?id') => {
  const toast = useToast();
  const apiInstance = getApi();

  const fetchData = async () => {
    if (!id) {
      if (setIsLoading) setIsLoading(false);
      return;
    }
    if (setIsLoading) setIsLoading(true);
    try {
      const response = await apiInstance.get(`${api}/${keyGetById}=${id}`);
      const data = response?.data || response;
      if (setData) setData(data);
    } catch (err) {
      toast.error('notFound', null, 'GeneralMessages');
      if (prevRoute) router.replace(prevRoute);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return fetchData;
};

export default useGetById;
