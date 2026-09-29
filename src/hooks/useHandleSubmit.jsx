import { getApi } from '../services/Api';
import useToast from './useToast';
import Generallist from '../ConfigData/Generallist.json';
import { HTTP_ERROR_CODES } from '../utils/httpErrorCodes';
import { showErrorSheet } from '../store/errorSheetSlice';
import { useDispatch } from 'react-redux';

/**
 * Custom hook for submitting add/edit forms: POSTs or PUTs to `${apiPage}/Add`
 * or `${apiPage}/Update`, then shows a success/error toast. Toast messages
 * live under the shared "GeneralMessages" resources page.
 */
const useHandleSubmit = () => {
  const toast = useToast();
  const apiInstance = getApi();
  const dispatch = useDispatch();

  /**
   * @param {string} apiPage - The API resource path (e.g. "VacationTransaction").
   * @param {Object} values - The form values to submit.
   * @param {number} [recId=0] - Existing record id; > 0 means edit, else add.
   * @param {Function} [setIsLoadingSubmit] - Loading state updater.
   * @param {Function} [setData] - Updater called with the API response data on success.
   * @param {Function} [onSuccess] - Called with the saved record id on success.
   * @param {boolean} [formData=false] - Send as multipart/form-data.
   */
  const handleSubmitFormik = async ({
    apiPage,
    values,
    recId = 0,
    setIsLoadingSubmit,
    setData,
    onSuccess,
    formData = false,
  }) => {
    const isEdit = recId > 0;
    const urlApi = isEdit ? `${apiPage}/Update` : `${apiPage}/Add`;
    const sendData = isEdit ? { ...values, recId } : values;
    const method = isEdit ? 'put' : 'post';

    try {
      if (setIsLoadingSubmit) setIsLoadingSubmit(true);
      const response = await apiInstance[method](
        urlApi,
        sendData,
        formData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
      );
      const data = response?.data || response;
      const codeMessage = data?.message;

      if (codeMessage === 200 || codeMessage === 1) {
        toast.success(isEdit ? 'editSuccessfully' : 'addedSuccessfully', null, 'GeneralMessages');
        if (setData) setData(data);
        onSuccess?.(data?.recId || recId);

        return data;
      } else if (codeMessage === 404) {
        toast.error('notFound', null, 'GeneralMessages');
      } else if (HTTP_ERROR_CODES.includes(codeMessage)) {
        toast.error(isEdit ? 'editFailed' : 'addFailed', null, 'GeneralMessages');
      } else {
        toast.success(isEdit ? 'editSuccessfully' : 'addedSuccessfully', null, 'GeneralMessages');
        if (setData) setData(data);
        onSuccess?.(data?.recId || recId);

        return data;
      }
    } catch (error) {

      const errorMessages = error?.details?.errorMessage || error?.details?.message;
      if (errorMessages?.length > 1) {
        dispatch(showErrorSheet({ errors: errorMessages, ResourcePage }));
      } else {
        toast.error(errorMessages[0] || 'requestFailed', null, 'GeneralMessages');
      }
    } finally {
      if (setIsLoadingSubmit) setIsLoadingSubmit(false);
    }
  };

  /**
   * Saves the form (Add/Update) then immediately submits it into the
   * workflow (`${apiPage}/Submit`), for the "submit with unsaved edits"
   * case. Mobile counterpart of the web handleUpdateAndSubmitTransaction —
   * no confiPage/ErrorsKeys/renderAction/navigateAfterAdd plumbing, just a
   * single onSuccess callback like handleSubmitFormik.
   *
   * @param {string} apiPage - The API resource path (e.g. "VacationTransaction");
   *   also used as the TransactionName lookup key.
   * @param {Object} values - The form values to save.
   * @param {number} [recId=0] - Existing record id; > 0 means edit, else add.
   * @param {Function} [setIsLoadingSubmitTransaction] - Loading state updater.
   * @param {Function} [setData] - Updater called with `{ ...savedData, status }` on success.
   * @param {Function} [onSuccess] - Called with the saved record id on success.
   */
  const handleUpdateAndSubmitTransaction = async ({
    apiPage,
    values,
    recId = 0,
    setIsLoadingSubmitTransaction,
    setData,
    onSuccess,
  }) => {
    const isEdit = recId > 0;
    const urlApi = isEdit ? `${apiPage}/Update` : `${apiPage}/Add`;
    const sendData = isEdit ? { ...values, recId } : values;
    const method = isEdit ? 'put' : 'post';
    const transactionName = Generallist.TransactionName?.find((t) => t.label === apiPage);

    try {
      if (setIsLoadingSubmitTransaction) setIsLoadingSubmitTransaction(true);

      const saveResponse = await apiInstance[method](urlApi, sendData);
      const saveData = saveResponse?.data || saveResponse;
      const savedRecId = saveData?.recId || recId;
      const codeMessage = saveData?.message;

      if (codeMessage === 200 || codeMessage === 1) {
        if (!transactionName?.value) {
          toast.error('submittedFailed', null, 'GeneralMessages');
          return;
        }

        const submitResponse = await apiInstance.post(`${apiPage}/Submit`, {
          transactionName: transactionName.value,
          transcationRecId: Number(savedRecId),
        });
        const submitData = submitResponse?.data || submitResponse;
        toast.success('submittedSuccessfully', null, 'GeneralMessages');
        if (setData) setData({ ...saveData, status: submitData });
        onSuccess?.(savedRecId);

        return submitData;
      } else if (codeMessage === 404) {
        toast.error('notFound', null, 'GeneralMessages');
      } else if (HTTP_ERROR_CODES.includes(codeMessage)) {
        toast.error('submittedFailed', null, 'GeneralMessages');
      } else {
        toast.error('submittedFailed', null, 'GeneralMessages');
      }

    } catch (error) {
      const errorMessages = error?.details?.errorMessage || error?.details?.message;
      if (errorMessages?.length > 1) {
        dispatch(showErrorSheet({ errors: errorMessages, ResourcePage }));
      } else {
        toast.error(errorMessages[0] || 'requestFailed', null, 'GeneralMessages');
      }
    } finally {
      if (setIsLoadingSubmitTransaction) setIsLoadingSubmitTransaction(false);
    }
  };

  return { handleSubmitFormik, handleUpdateAndSubmitTransaction };
};

export default useHandleSubmit;
