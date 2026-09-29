import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './useUserData';
import { formatDateOnlyForAPI } from './useFormatDate';

const useGridFilters = (columns = [], gridKey, keyEnum) => {
  const { isSelfService, employeeId } = useUserData();

  const getInitialValues = async () => {
    const rawFilterGrid = await AsyncStorage.getItem(`MegaGrid_Filters_${gridKey}`);
    const localStorageFilterGrid = rawFilterGrid ? JSON.parse(rawFilterGrid) : null;

    const defaultValueColumns = columns.filter(
      (column) => column.defaultValueFilter,
    );
    const defaultValueColumnsIsSelfService = isSelfService
      ? columns.filter((column) => column.valueFilterIsSelfService)
      : [];
    const defaultInitialValues = columns.reduce((acc, column) => {
      acc[column.key] = '';
      return acc;
    }, {});

    if (localStorageFilterGrid) {
      const FilterGrid = localStorageFilterGrid;

      return {
        initialValues: defaultInitialValues,
        valuesFilter: FilterGrid,
        filterFields: Object.keys(FilterGrid).filter(
          (key) =>
            !FilterGrid[key]?.defaultValueIsSelfService &&
            FilterGrid[key] !== '' &&
            FilterGrid[key] !== null,
        ),
      };
    } else if (defaultValueColumns.length > 0) {
      const FilterGrid = defaultValueColumns.reduce((acc, column) => {
        acc[column.key] = column.defaultValueFilter
          ? [
              dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
              dayjs().format('YYYY-MM-DD'),
            ]
          : ['', ''];
        return acc;
      }, {});
      return {
        initialValues: defaultInitialValues,
        isDefaultValueFilter: true,
        valuesFilter: FilterGrid,
        defaultValueFilter: FilterGrid,
        filterFields: Object.keys(FilterGrid).filter(
          (key) =>
            FilterGrid[key][0] !== '' &&
            FilterGrid[key][0] !== null &&
            FilterGrid[key][1] !== '' &&
            FilterGrid[key][1] !== null,
        ),
      };
    } else if (defaultValueColumnsIsSelfService.length > 0) {
      const FilterGrid = defaultValueColumnsIsSelfService.reduce(
        (acc, column) => {
          const Key = column?.sendfillterKey
            ? column?.sendfillterKey
            : column?.lookupName
              ? column.keyRecId
              : column.key;

          acc[column.key] =
            column.keyFilterIsSelfService == 'employeeId'
              ? [
                  {
                    value: employeeId,
                    sendkey: Key,
                    defaultValueIsSelfService: true,
                  },
                ]
              : [];

          return acc;
        },
        {},
      );
      return {
        initialValues: defaultInitialValues,
        isDefaultValueFilter: true,
        valuesFilter: FilterGrid,
        defaultValueFilter: FilterGrid,
        defaultValueColumnIsSelfService: true,
        filterFields: Object.keys(FilterGrid).filter(
          (key) =>
            FilterGrid[key][0] !== '' &&
            FilterGrid[key][0] !== null &&
            FilterGrid[key][1] !== '' &&
            FilterGrid[key][1] !== null,
        ),
      };
    } else {
      return {
        initialValues: defaultInitialValues,
        filterFields: [],
      };
    }
  };

  const sendData = (values) => {
    const result = {
      filters: [],
      useAnd: true,
    };
    for (const key in values) {
      const column = columns.find((col) => col.key === key);
      if (!column) continue;
      const sendKey = column?.sendfillterKey
        ? column?.sendfillterKey
        : column?.lookupName
          ? column.keyRecId
          : column?.generallist
            ? column?.secondKey || column?.sendKey
            : key;
      const operator = column?.lookupName
        ? 9
        : column?.generallist ||
            column.type == 'number' ||
            column.type == 'percent' ||
            column.type == 'time'
          ? 0
          : column.type == 'date' || column.type == 'dateTime'
            ? 10
            : 2;
      const type = column.type;
      const SendValue = values[key];
      if (
        type === 'date' ||
        (type === 'dateTime' && Array.isArray(SendValue))
      ) {
        const [Value, ValueTo] = SendValue;
        const dateValue = column?.dateOnlyisFilter
          ? formatDateOnlyForAPI(Value)
          : Value;
        const dateValueTo = column?.dateOnlyisFilter
          ? formatDateOnlyForAPI(ValueTo)
          : ValueTo;

        if (Value && Value !== '') {
          result.filters.push({
            field: sendKey,
            operator,
            Value: dateValue,
            ValueTo: dateValueTo || '',
            type: keyEnum,
          });
        }
      } else {
        if (
          SendValue !== undefined &&
          SendValue !== null &&
          SendValue !== '' &&
          (!Array.isArray(SendValue) || SendValue.length > 0)
        ) {
          const mappedValues = Array.isArray(SendValue)
            ? SendValue.map((v) => String(v.value))
            : SendValue?.value !== undefined && SendValue?.value !== null
              ? String(SendValue.value)
              : SendValue;

          const filterItem = {
            field: sendKey,
            operator: column?.filterHasValue
              ? mappedValues == 2
                ? 1
                : 0
              : operator,
            ValueTo: '',
            type: keyEnum,
          };

          if (!column?.filterHasValue) {
            filterItem.Value = mappedValues;
          }

          result.filters.push(filterItem);
        }
      }
    }

    return result;
  };

  return {
    getInitialValues,
    sendData,
  };
};

export default useGridFilters;
