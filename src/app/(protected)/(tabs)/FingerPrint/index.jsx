import { useCallback, useMemo, useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import dayjs from 'dayjs';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { useUserData } from '../../../../hooks/useUserData';
import { formatDateOnlyForAPI } from '../../../../hooks/useFormatDate';
import useGetData from '../../../../hooks/useGetData';
import useMonthlyYearLookup from '../../../../hooks/useMonthlyYearLookup';
import MonthNavigator from '../../../../components/MonthNavigator';
import MonthNavigatorSkeleton from '../../../../components/Skeleton/MonthNavigatorSkeleton';
import ActionButtonSkeleton from '../../../../components/Skeleton/ActionButtonSkeleton';
import AttendanceCard from '../../../../components/FingerPrint/AttendanceCard';
import AttendanceCardSkeleton from '../../../../components/Skeleton/AttendanceCardSkeleton';
import DropdownActions from '../../../../components/DropdownActions';
import { IconFilter } from '../../../../assets/IconsSvg';

export default function FingerPrint() {
  const { globalStyles, colors, spacing, rowDirection, iconSize, currentLanguage } = useDesignSystem();
  const { employeeId } = useUserData();
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    monthYearOptions,
    selectedMonthYearValues,
    setSelectedMonthYearValues,
    currentIndex,
    currentOption,
    isLoading: isLoadingHeader,
    loadData: reloadLookup,
  } = useMonthlyYearLookup(
    'DailyAttendance/MonthYearLookup',
    employeeId,
    currentLanguage,
  );
  const month = useMemo(() => (currentOption ? dayjs(currentOption.value) : dayjs()), [currentOption]);
   const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((row) => (statusFilter === 'late' ? row.isLate : !row.isLate));
  }, [data, statusFilter]);
   const statusFilterMenuItems = useMemo(
    () => [
      { label: 'all', isActive: statusFilter === 'all', onClick: () => setStatusFilter('all') },
      { label: 'late', isActive: statusFilter === 'late', onClick: () => setStatusFilter('late') },
      { label: 'Present', isActive: statusFilter === 'present', onClick: () => setStatusFilter('present') },
    ],
    [statusFilter]
  );

  const fetchData = useGetData(
    `DailyAttendance/GetMyMonthlyAttendanceSummary?date=`,
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
        getData(selectedMonthYearValues)
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
        }} >
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
          ) : (
            <DropdownActions
              icon={
                <View>
                  <IconFilter color={colors.title} size={iconSize.md} />
                  {statusFilter !== 'all' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        insetInlineEnd: -2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: statusFilter === 'late' ? colors.error : colors.success,
                      }}
                    />
                  )}
                </View>
              }
              menuItems={statusFilterMenuItems}
              ResourcePage="Dashboard"
              style={globalStyles?.btnActions}
            />
          )}
        </View>

        {isLoading  ? (
          <View>
            {[0, 1, 2,4,5,6,7].map((i) => (
              <AttendanceCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlashList
            data={filteredData}
            keyExtractor={(row) => row.attendanceDate}
            renderItem={({ item }) => <AttendanceCard row={item} />}
            estimatedItemSize={150}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
}
