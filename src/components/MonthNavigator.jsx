import { View, TouchableOpacity } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { AngleArrow, IconCalendarSearch } from '../assets/IconsSvg';
import AutoFontText from './AutoFontText';
import CustomSelectBottomSheet from './Shared/CustomSelectBottomSheet';
import { useFormatMonthYearShort } from '../hooks/useFormatDate';

export default function MonthNavigator({ monthYearOptions, currentIndex, selectedMonthYearValues, setSelectedMonthYearValues }) {
  const { globalStyles, colors, spacing, rowDirection, isRTL, iconSize, currentLanguage } = useDesignSystem();
  const formatMonthYearShort = useFormatMonthYearShort(currentLanguage);
  const sheetRef = useRef(null);
  const [search, setSearch] = useState('');

  const disablePrevious = currentIndex <= 0;
  const disableNext = currentIndex < 0 || currentIndex >= monthYearOptions.length - 1;

  const displayMonthYear = useMemo(() => {
    if (!selectedMonthYearValues) return '';
    const date = dayjs(selectedMonthYearValues);
    const year = date.year();
    const month = date.month() + 1;
    return formatMonthYearShort(year, month);
  }, [selectedMonthYearValues, formatMonthYearShort]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return monthYearOptions;
    return monthYearOptions.filter(item =>
      item.label?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, monthYearOptions]);

  const onPrevious = () => {
    if (disablePrevious) return;
    setSelectedMonthYearValues(monthYearOptions[currentIndex - 1]?.value);
  };

  const onNext = () => {
    if (disableNext) return;
    setSelectedMonthYearValues(monthYearOptions[currentIndex + 1]?.value);
  };

  const handleSelectMonth = (item) => {
    setSelectedMonthYearValues(item.value);
  };

  const isSelected = (item) => item.value === selectedMonthYearValues;

  return (
    <View
      style={{
        flexDirection: rowDirection,
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
      <TouchableOpacity
        onPress={() => sheetRef.current?.present()}
        style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}
      >
        <IconCalendarSearch size={iconSize.base} color={colors.title} />
        <AutoFontText value={displayMonthYear} color="title" size="lg" weight="bold" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles?.btnActionsArrow, disablePrevious && { opacity: 0.4 }]}
        onPress={onPrevious}
        disabled={disablePrevious}
      >
        <View style={!isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
          <AngleArrow color={colors.title} size={iconSize.md} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles?.btnActionsArrow, disableNext && { opacity: 0.4 }]}
        onPress={onNext}
        disabled={disableNext}
      >
        <View style={isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
          <AngleArrow color={colors.title} size={iconSize.md} />
        </View>
      </TouchableOpacity>

      <CustomSelectBottomSheet
        sheetRef={sheetRef}
        options={filteredOptions}
        search={search}
        setSearch={setSearch}
        isMulti={false}
        isSelected={isSelected}
        onSelect={handleSelectMonth}
        isSearchable={true}
        title="selectMonthYear"
        ResourcePage="GeneralField"
       />
    </View>
  );
}
