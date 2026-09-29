import { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import dayjs from 'dayjs';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { useUserData } from '../../../../hooks/useUserData';
import { useRefreshControlProps } from '../../../../hooks/useRefreshControlProps';
import MonthCalendarGrid from '../../../../components/Schedule/MonthCalendarGrid';
import MonthCalendarGridSkeleton from '../../../../components/Skeleton/MonthCalendarGridSkeleton';
import MonthNavigator from '../../../../components/MonthNavigator';
import MonthNavigatorSkeleton from '../../../../components/Skeleton/MonthNavigatorSkeleton';
import ActionButtonSkeleton from '../../../../components/Skeleton/ActionButtonSkeleton';
import AgendaListView from '../../../../components/Schedule/AgendaListView';
import AgendaListSkeleton from '../../../../components/Skeleton/AgendaListSkeleton';
import TranslationText from '../../../../components/TranslationText';
import BottomSheetModalViwer from '../../../../components/BottomSheetModalViwer';
import DropdownActions from '../../../../components/DropdownActions';
import useGetData from '../../../../hooks/useGetData';
import { formatDateOnlyForAPI } from '../../../../hooks/useFormatDate';
import {
  IconArrow,
  IconCalendar,
  IconInfo,
  IconGridView,
  IconListView,
} from '../../../../assets/IconsSvg';
import { STATUS_COLOR_LIST, getStatusColor } from '../../../../components/Schedule/shiftPalette';
import useMonthlyYearLookup from '../../../../hooks/useMonthlyYearLookup';

export default function ScheduleScreen() {
  const { globalStyles, colors, spacing, stylesText, rowDirection, isRTL, radius, iconSize, currentLanguage } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();
  const [viewMode, setViewMode] = useState('grid');
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { employeeId } = useUserData();
  const {
    monthYearOptions,
    selectedMonthYearValues,
    setSelectedMonthYearValues,
    currentIndex,
    currentOption,
    isLoading: isLoadingHeader,
    loadData: reloadLookup,
  } = useMonthlyYearLookup(
    'PlannedAttendance/MonthYearLookup',
    employeeId,
    currentLanguage,
  );
  const month = useMemo(() => (currentOption ? dayjs(currentOption.value) : dayjs()), [currentOption]);

  const fetchData = useGetData(
    `PlannedAttendance/GetSelfServicePlannedAttendanceSimple?currentDate=`,
    setIsLoading,
    setData,
    null,
  );


  const getData = (date, setIsLoading) => {
    if (date)
      fetchData(`${formatDateOnlyForAPI(date)}`, setIsLoading)
  };

  const handleRefresh = useCallback(() => {
    reloadLookup();
    getData(selectedMonthYearValues, setIsLoading);
  }, [selectedMonthYearValues, reloadLookup]);
  useFocusEffect(
    useCallback(() => {
      getData(selectedMonthYearValues, setIsLoading)
    }, [selectedMonthYearValues])
  );

  const viewModeMenuItems = useMemo(
    () => [
      {
        label: 'grid',
        page: 'Schedule',
        isActive: viewMode === 'grid',
        icon: IconGridView,
        onClick: () => setViewMode('grid'),
      },
      {
        label: 'list',
        page: 'Schedule',
        isActive: viewMode === 'list',
        icon: IconListView,
        onClick: () => setViewMode('list'),
      },
    ],
    [viewMode, colors, iconSize]
  );

  const renderLegendItem = useCallback(
    ({ item }) => (
      <View
        style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 2.5,
            backgroundColor: getStatusColor(item.type),
          }}
        />
        <TranslationText
          page={item.page}
          title={item.title}
          style={stylesText({ color: 'title', size: 'md' })}
        />
      </View>
    ),
    [rowDirection, spacing, stylesText]
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
          <View style={{
            flexDirection: rowDirection,
            alignItems: 'center',
            gap: spacing.md,
          }}>
            {isLoadingHeader ? (
              <>
                <ActionButtonSkeleton />
                <ActionButtonSkeleton />
              </>
            ) : (
              <>
                <DropdownActions
                  icon={
                    viewMode === 'grid' ? (
                      <IconGridView color={colors.title} size={iconSize.md} />
                    ) : (
                      <IconListView color={colors.title} size={iconSize.md} />
                    )
                  }
                  menuItems={viewModeMenuItems}
                  style={globalStyles?.btnActions}
                />
                <BottomSheetModalViwer
                  btn={
                    <TouchableOpacity style={globalStyles?.btnActions}>
                      <IconInfo color={colors.title} size={iconSize.md} />
                    </TouchableOpacity>
                  }
                  snapPoints={['45%']}
                  data={STATUS_COLOR_LIST}
                  keyExtractor={(item) => item.type}
                  renderItem={renderLegendItem}
                />
              </>
            )}
          </View>

        </View>


        <View style={{ flex: 1 }}>
          {isLoading ? (
            viewMode === 'grid' ? <MonthCalendarGridSkeleton /> : <AgendaListSkeleton />
          ) : viewMode === 'grid' ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} {...refreshControlProps} />
              }
            >
              <MonthCalendarGrid month={month} data={data} />
            </ScrollView>
          ) : (
            <AgendaListView month={month} data={data} refreshing={isLoading} onRefresh={handleRefresh} />
          )}
        </View>
      </View>
    </View>
  );
}
