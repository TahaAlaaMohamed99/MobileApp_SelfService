import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getApi } from "../services/Api";
import { useGetDatePeriod } from "./useGetDatePeriod";
import { getCurrentDate, useFormatMonthName } from "./useFormatDate";

const findClosest = (list, target, getValue) =>
  list.find((item) => getValue(item) === target) ??
  list.find((item) => getValue(item) > target) ??
  [...list].reverse().find((item) => getValue(item) < target);

export const formatMonthYear = (year, month) => `${year}-${String(month).padStart(2, "0")}-01`;

const useMonthlyYearLookup = (
  endpoint = "MonthlyAttendance/MonthlyYearLookup",
  employeeId,
  currentLanguage = "en"
) => {
  const api = getApi();
  const formatMonthName = useFormatMonthName(currentLanguage);
  const { currentYear, currentMonth } = useGetDatePeriod(getCurrentDate());

  const [yearOptions, setYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [monthYearOptions, setMonthYearOptions] = useState([]);

  const [selectedYear, setSelectedYear] = useState();
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedMonthYearValues, setSelectedMonthYearValues] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {

      const data = (await api.get(`${endpoint}?employeeId=${employeeId}`)) ?? [];

      const years = data
        .map((item) => ({
          label: String(item.year),
          value: item.year,
          months: [...item.months].sort((a, b) => a - b),
        }))
        .sort((a, b) => a.value - b.value);

      const monthYears = years.flatMap((yearItem) =>
        yearItem.months.map((month) => {
          const value = formatMonthYear(yearItem.value, month);
          const monthName = formatMonthName(yearItem.value, month);
          return { label: `${monthName} ${yearItem.value}`, value, year: yearItem.value, month };
        })
      );

      setYearOptions(years);
      setMonthYearOptions(monthYears);

      const year = findClosest(years, currentYear, (item) => item.value) ?? {
        value: currentYear,
        months: [],
      };

      setSelectedYear(year.value);
      setMonthOptions(year.months.map((month) => ({ label: String(month), value: month })));

      const month = findClosest(year.months, currentMonth, (item) => item) ?? currentMonth;

      setSelectedMonth(month);

      if (year.value != null && month != null) {
        setSelectedMonthYearValues(formatMonthYear(year.value, month));
      } else {
        setSelectedMonthYearValues('');
      }
    } catch (error) {
      const defaultMonthYear = {
        label: formatMonthName(currentYear, currentMonth) + ' ' + currentYear,
        value: formatMonthYear(currentYear, currentMonth),
        year: currentYear,
        month: currentMonth,
      };
      setSelectedMonthYearValues(defaultMonthYear.value);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, employeeId, currentYear, currentMonth, formatMonthName, api]);
  useFocusEffect(
    useCallback(() => {

      if (!employeeId) return;

      loadData();
    }, [employeeId, endpoint])
  );

  const monthYearValues = useMemo(
    () => monthYearOptions.map((item) => item.label),
    [monthYearOptions]
  );

  const selectedMonthYear = useMemo(
    () => (selectedYear == null || selectedMonth == null ? "" : formatMonthYear(selectedYear, selectedMonth)),
    [selectedYear, selectedMonth]
  );

  const currentIndex = useMemo(
    () => monthYearOptions.findIndex((item) => item.value === selectedMonthYearValues),
    [monthYearOptions, selectedMonthYearValues]
  );

  const currentOption = monthYearOptions[currentIndex];

  return {
    yearOptions,
    monthOptions,
    monthYearOptions,
    monthYearValues,

    selectedYear,
    setSelectedYear,

    selectedMonth,
    setSelectedMonth,

    selectedMonthYear,
    selectedMonthYearValues,
    setSelectedMonthYearValues,

    currentIndex,
    currentOption,

    isLoading,
    loadData,
  };
};

export default useMonthlyYearLookup;
