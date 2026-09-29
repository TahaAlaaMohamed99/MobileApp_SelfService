import { useMemo } from 'react';
import { parseAPIDate } from './useFormatDate';

export default function useTransactionInitialValues(
  data,
  transactionkey = 'transDate',
) {
  return useMemo(
    () => ({
      name: data?.name || '',
      [transactionkey]: data?.[transactionkey]
        ? parseAPIDate(data[transactionkey])
        : new Date(),
      executionDate: data?.executionDate
        ? parseAPIDate(data.executionDate)
        : new Date(),
      code: data?.code || '',
    }),
    [data],
  );
}
