import { getApi } from '../services/Api';
import useToast from './useToast';

/**
 * Deletes a single record via `${apiPage}/DeleteById?id=${id}`. Mobile
 * counterpart of the web useDeleteActions — no multipleDelete/grid-state
 * plumbing since self-service list screens here have no bulk-select. Toast
 * messages live under the shared "GeneralMessages" resources page.
 */
const useDeleteActions = () => {
  const toast = useToast();
  const apiInstance = getApi();

  /**
   * @param {string} apiPage - The API resource path (e.g. "VacationTransaction").
   * @param {number} id - recId of the record to delete.
   * @param {Function} [setIsLoading] - Loading state updater.
   * @param {Function} [onSuccess] - Called with the response data on success.
   */
  const singleDelete = async ({ apiPage, id, setIsLoading, onSuccess }) => {
    try {
      if (setIsLoading) setIsLoading(true);
      const response = await apiInstance.delete(`${apiPage}/DeleteById?id=${id}`);
      const data = response?.data;

      if (data?.message === 200) {
        toast.success('deletedOneSuccessfully', null, 'GeneralMessages');
        onSuccess?.(data);
      } else {
        toast.error(data?.messageText || 'deletedOneFailed', null, 'GeneralMessages');
      }
      return data;
    } catch (error) {
      toast.error('deletedOneFailed', null, 'GeneralMessages');
      throw error;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return { singleDelete };
};

export default useDeleteActions;
