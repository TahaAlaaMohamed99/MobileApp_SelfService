import { getApi } from '../services/Api';
import Generallist from '../ConfigData/Generallist.json';
import useToast from './useToast';

const useGetWorkFlowTransactionLog = (
  id,
  keyPage,
  setIsLoading,
  setWorkFlowTransaction,
  isSendNotification,
  code,
  workfollowLevelNumber = 1
) => {
  const toast = useToast();
  const apiInstance = getApi();

  const transactionName = Generallist.TransactionName?.find(
    (page) => page.label == keyPage
  );

  const fetchData = async () => {
    if (!id || !transactionName?.value) return;

    setIsLoading(true);

    try {
      const response = await apiInstance.get(
        `WorkFlowTransactionLog/GetLogsGroupedByLevel?transactionRecId=${id}&TransactionName=${transactionName.value}`
      );
      const data = response?.data || response;

      setWorkFlowTransaction(data);
    } catch (err) {
      toast.error(err?.message || err?.details?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return fetchData;
};

export default useGetWorkFlowTransactionLog;
