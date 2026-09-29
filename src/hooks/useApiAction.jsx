import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getApi } from '../services/Api';
import { HTTP_ERROR_CODES } from '../utils/httpErrorCodes';
import useToast from './useToast';
import { showErrorSheet } from '../store/errorSheetSlice';

/**
 * Generic hook for one-off API calls (GET/POST/PUT/DELETE) that don't fit
 * useGetData's fixed-GET or useHandleSubmit's Add/Update conventions —
 * e.g. a POST to a custom calculation endpoint with its own payload.
 */
const useApiAction = () => {
  const apiInstance = getApi();
  const toast = useToast();
  const dispatch = useDispatch();

  /**
   * @param {string} method - 'get' | 'post' | 'put' | 'delete'
   * @param {string} url - API path (relative to the api base URL).
   * @param {Object} [payload] - Request body, sent for non-GET methods.
   * @param {Function} [setIsLoading] - Loading state updater.
   * @param {Function} [onSuccess] - Called with the response data on success.
   * @param {Function} [onError] - Called with the error on failure.
   * @param {string} [ResourcePage] - i18n page key, shown as the error sheet's title.
   */
  const callApi = useCallback(
    async ({ method = 'get', url, payload, setIsLoading, onSuccess, onError, ResourcePage, onFinally }) => {
      try {
        if (setIsLoading) setIsLoading(true);

        const response =
          method === 'get' || method === 'delete'
            ? await apiInstance[method](url)
            : await apiInstance[method](url, payload);

        const data = response?.data || response;
        const codeMessage = data?.message;

        if (codeMessage === 200 || codeMessage === 1) {
          onSuccess?.(data);
          return data;
        } else if (codeMessage === 404) {
          toast.error('notFound', null, 'GeneralMessages');
          return null;
        } else if (HTTP_ERROR_CODES.includes(codeMessage)) {

          toast.error('requestFailed', null, 'GeneralMessages');
          return null;
        } else {
          onSuccess?.(data);
          return data;
        }
      } catch (error) {
        onFinally?.();

        const errorMessages = error?.details?.errorMessage || error?.details?.message;
        if (errorMessages?.length > 1) {
          dispatch(showErrorSheet({ errors: errorMessages, ResourcePage }));
        } else {
          toast.error(errorMessages[0] || 'requestFailed', null, 'GeneralMessages');
        }
        return null;
      } finally {
        if (setIsLoading) setIsLoading(false);
        onFinally?.();
      }
    },
    [apiInstance, dispatch]
  );

  return { callApi };
};

export default useApiAction;
