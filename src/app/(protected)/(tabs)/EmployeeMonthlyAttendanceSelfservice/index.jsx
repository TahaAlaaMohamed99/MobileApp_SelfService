import { useCallback, useMemo, useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { useUserData } from '../../../../hooks/useUserData';
import { formatDateOnlyForAPI } from '../../../../hooks/useFormatDate';
import useGetData from '../../../../hooks/useGetData';
import useMonthlyYearLookup from '../../../../hooks/useMonthlyYearLookup';
import useGridData from '../../../../hooks/useGridData';
import MonthNavigator from '../../../../components/MonthNavigator';
import MonthNavigatorSkeleton from '../../../../components/Skeleton/MonthNavigatorSkeleton';
import ActionButtonSkeleton from '../../../../components/Skeleton/ActionButtonSkeleton';
import MegaGrid from '../../../../components/MegaGrid';
import { DataPages } from '../../../../ConfigData/DataPages';

const ResourcePage = 'EmployeeMonthlyAttendanceSelfservice';

export default function EmployeeMonthlyAttendanceSelfserviceScreen() {
  const { globalStyles, spacing, rowDirection, currentLanguage } = useDesignSystem();
  const { employeeId } = useUserData();
  const DataPage = DataPages.EmployeeMonthlyAttendanceSelfservice;
  const { mapGeneralList } = useGridData(null, DataPage?.gridList);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    monthYearOptions,
    selectedMonthYearValues,
    setSelectedMonthYearValues,
    currentIndex,
    currentOption,
    isLoading: isLoadingHeader,
    loadData: reloadLookup,
  } = useMonthlyYearLookup(
    'MonthlyAttendance/MonthlyYearLookup',
    employeeId,
    currentLanguage,
  );

  const formatedData = useMemo(
    () => data.map((item) => mapGeneralList(item)),
    [data, mapGeneralList]
  );

  const fetchData = useGetData(
    `DailyAttendance/EmployeeMonthlyAttendance?employeeRecId=${employeeId}&date=`,
    setIsLoading,
    setData,
    null,
  );

  const getData = (date) => {
    if (date)
      fetchData(`${formatDateOnlyForAPI(date)}`);
  };

  const handleRefresh = useCallback(() => {
    reloadLookup();
    getData(selectedMonthYearValues);
  }, [selectedMonthYearValues, reloadLookup]);

  useFocusEffect(
    useCallback(() => {
      if (selectedMonthYearValues)
        getData(selectedMonthYearValues);
      else setIsLoading(false)
    }, [selectedMonthYearValues])
  );

  return (
    <View style={[globalStyles.container, { paddingTop: spacing.lg }]}>
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.xl,
          gap: spacing.md,
        }}>
          {isLoadingHeader ? (
            <MonthNavigatorSkeleton />
          ) : (
            <MonthNavigator
              selectedMonthYearValues={selectedMonthYearValues}
              monthYearOptions={monthYearOptions}
              currentIndex={currentIndex}
              setSelectedMonthYearValues={setSelectedMonthYearValues}
            />
          )}
          {isLoadingHeader ? (
            <ActionButtonSkeleton />
          ) : null}
        </View>
        <MegaGrid
          GridKey={ResourcePage}
          columns={DataPage?.columns}
          data={data}
          ResourcePage={ResourcePage}
          isSearch={false}
          isFilterGrid={false}
          refreshing={isLoading}
          loading={isLoading}
          onRefresh={handleRefresh}
        />
      </View>
    </View>
  );
}
