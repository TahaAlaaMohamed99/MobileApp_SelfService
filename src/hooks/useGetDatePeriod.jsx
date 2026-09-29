import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

export const useGetDatePeriod = (currentDate) => {
  const generalParameter = useSelector((state) => state.generalParameterSlice.data);
  const endMonthDay = generalParameter?.isCalculateMonthBasedOnEndMonthDay == 1 ? null : generalParameter?.endMonthDay;
  return useMemo(() => {
        const current = dayjs(currentDate);

    if (endMonthDay == null) {
      return { currentYear: current.year(), currentMonth: current.month() + 1 };
    }
    const targetMonth = current.date() <= endMonthDay ? current : current.add(1, 'month');

    return { currentYear: targetMonth.year(), currentMonth: targetMonth.month() + 1 };
  }, [currentDate, endMonthDay]);
};
