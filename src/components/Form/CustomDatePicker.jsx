import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useFormatDate } from '../../hooks/useFormatDate';
import TranslationText from '../TranslationText';
import AutoFontText from '../AutoFontText';
import CustomeBtn from '../CustomeBtn';
import { IconCalendar, IconClose } from '../../assets/IconsSvg';

/**
 * CustomDatePicker — mobile date/date-range field (BottomSheetModal picker
 * built on react-native-ui-datepicker), matching CustomInput/CustomSelect's
 * conventions (label, Required, touched/errors, translations).
 *
 * Single mode:  value = Date|string|null,              onChange(date)
 * Range mode (isDateRange): value = { startDate, endDate } | null, onChange({ startDate, endDate })
 */
export default function CustomDatePicker({
  label,
  touched,
  errors,
  Required = false,
  onBlur,
  onChange,
  onClose,
  value,
  minDate,
  maxDate,
  isWhite = false,
  disabled = false,
  viewTime = false,
  isDateRange = false,
  isLoading = false,
  ResourcePage = '',
  style,
}) {
  const { colors, spacing, radius, shadows, fonts, text, textAlign, rowDirection, currentLanguage, stylesText, globalStyles, iconSize, isDark } =
    useDesignSystem();
  const defaultPickerStyles = useDefaultStyles(isDark ? 'dark' : 'light');

  const sheetRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [pendingRange, setPendingRange] = useState({ startDate: null, endDate: null });

  const hasValue = isDateRange ? !!(value?.startDate && value?.endDate) : !!value;

  const displayText = isDateRange
    ? hasValue
      ? `${useFormatDate(value.startDate, currentLanguage, viewTime)} - ${useFormatDate(value.endDate, currentLanguage, viewTime)}`
      : ''
    : hasValue
      ? useFormatDate(value, currentLanguage, viewTime)
      : '';

  const pickerStyles = useMemo(
    () => ({
      ...defaultPickerStyles,

      header: { marginBottom: spacing.sm },
      month_selector_label: { fontFamily: fonts.semiBold, fontSize: text.base, color: colors.title },
      year_selector_label: { fontFamily: fonts.semiBold, fontSize: text.base, color: colors.title },
      time_selector_label: { fontFamily: fonts.semiBold, fontSize: text.base, color: colors.title },
      button_prev_image: { tintColor: colors.title },
      button_next_image: { tintColor: colors.title },

      weekday_label: { fontFamily: fonts.semiBold, fontSize: text.sm, color: colors.placeholder },

      day: { borderRadius: radius.md },
      day_label: { fontFamily: fonts.regular, fontSize: text.md, color: colors.title },
      outside_label: { fontFamily: fonts.regular, fontSize: text.md, color: colors.placeholder },
      disabled_label: { color: colors.disabledText, opacity: 1 },

      today: { borderColor: colors.primary },
      today_label: { color: colors.primary, fontFamily: fonts.medium },

      selected: { backgroundColor: colors.primary, borderRadius: radius.md },
      selected_label: { color: '#fff', fontFamily: fonts.medium },

      range_fill: { backgroundColor: `${colors.primary}22` },
      range_start: { backgroundColor: colors.primary, borderRadius: radius.md },
      range_start_label: { color: '#fff', fontFamily: fonts.medium },
      range_end: { backgroundColor: colors.primary, borderRadius: radius.md },
      range_end_label: { color: '#fff', fontFamily: fonts.medium },
      range_middle: { backgroundColor: `${colors.primary}22` },
      range_middle_label: { color: colors.title, fontFamily: fonts.regular },

      month: { borderColor: colors.border, borderRadius: radius.md },
      month_label: { fontFamily: fonts.regular, fontSize: text.md, color: colors.title },
      selected_month: { backgroundColor: colors.primary, borderColor: colors.primary },
      selected_month_label: { color: '#fff', fontFamily: fonts.medium },

      year: { borderColor: colors.border, borderRadius: radius.md },
      year_label: { fontFamily: fonts.regular, fontSize: text.md, color: colors.title },
      selected_year: { backgroundColor: colors.primary, borderColor: colors.primary },
      selected_year_label: { color: '#fff', fontFamily: fonts.medium },
      active_year: { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}22` },
      active_year_label: { color: colors.primary, fontFamily: fonts.medium },

      time_label: { fontFamily: fonts.medium, fontSize: text.lg, color: colors.title },
      time_selected_indicator: { backgroundColor: `${colors.primary}22`, borderRadius: radius.md },
    }),
    [defaultPickerStyles, colors, fonts, text, radius, spacing]
  );

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const openSheet = () => {
    if (disabled) return;
    setIsFocused(true);
    if (isDateRange) {
      setPendingRange({ startDate: value?.startDate ?? null, endDate: value?.endDate ?? null });
    } else {
      setPendingDate(value ?? null);
    }
    sheetRef.current?.present();
  };

  const handlePickerChange = (params) => {
    if (isDateRange) {
      const nextRange = { startDate: params.startDate ?? null, endDate: params.endDate ?? null };
      setPendingRange(nextRange);
      if (!viewTime) {
        onChange?.(nextRange);
        if (nextRange.startDate && nextRange.endDate) {
          sheetRef.current?.dismiss();
        }
      }
    } else {
      setPendingDate(params.date ?? null);
      if (!viewTime) {
        onChange?.(params.date ?? null);
        sheetRef.current?.dismiss();
      }
    }
  };

  const handleCancel = () => {
    sheetRef.current?.dismiss();
  };

  const handleConfirm = () => {
    onChange?.(isDateRange ? pendingRange : pendingDate);
    sheetRef.current?.dismiss();
  };

  const handleDismiss = () => {
    setIsFocused(false);
    onBlur?.();
    onClose?.();
  };

  const renderFooter = useCallback(
    (props) =>
      viewTime ? (
        <BottomSheetFooter {...props} bottomInset={spacing.base}>
          <View style={{ flexDirection: rowDirection, paddingHorizontal: spacing.base, gap: spacing.base }}>
            <CustomeBtn title="cancel" type="cancel" size="btn_md" style={{ flex: 1 }} ResourcePage="GeneralActions" onPress={handleCancel} />
            <CustomeBtn title="confirm" type="primary" size="btn_md" style={{ flex: 1 }} ResourcePage="GeneralActions" onPress={handleConfirm} />
          </View>
        </BottomSheetFooter>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewTime, pendingDate, pendingRange, spacing, rowDirection]
  );

  return (
    <View style={[globalStyles.containerFiled, style]}>
      {label && (
        <View style={{ flexDirection: rowDirection, alignItems: 'center', marginBottom: spacing.xs }}>
          <TranslationText title={label} page={ResourcePage} style={globalStyles.labelTxt} />
          {Required && <Text style={{ color: colors.primary, fontFamily: fonts.medium }}> *</Text>}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openSheet}
        disabled={disabled}
        style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          borderWidth: 1.2,
          borderColor: disabled ? colors.disabled : touched && errors ? colors.error : isFocused ? colors.primary : colors.border,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.disabled : isWhite ? colors.surface : colors.background,
          paddingHorizontal: spacing.sm,
          height: 44,
          gap: spacing.xs,
          ...shadows.light,
        }}
      >
        <AutoFontText
          value={displayText}
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: text.md,
            color: hasValue ? (disabled ? colors.disabledText : colors.title) : colors.placeholder,
            textAlign,
          }}
        />

        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <IconCalendar color={colors.text} size={iconSize.sm} />
        )}
      </TouchableOpacity>

      {touched && errors && <TranslationText title={errors} page={ResourcePage} style={globalStyles.errorTxt} />}

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        enableDynamicSizing
        enableContentPanningGesture={!viewTime}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={{ padding: spacing.base, paddingBottom: viewTime ? spacing.xxl + spacing.xl : spacing.xxl }}>
          <View
            style={{
              flexDirection: rowDirection,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.base,
            }}
          >
            <TranslationText title={label} page={ResourcePage} style={stylesText({ color: 'title', size: 'base', weight: 'bold' })} />
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
              <IconClose color={colors.placeholder} size={iconSize.md} />
            </TouchableOpacity>
          </View>

          <DateTimePicker
            mode={isDateRange ? 'range' : 'single'}
            date={!isDateRange ? pendingDate : undefined}
            startDate={isDateRange ? pendingRange.startDate : undefined}
            endDate={isDateRange ? pendingRange.endDate : undefined}
            onChange={handlePickerChange}
            minDate={minDate || undefined}
            maxDate={maxDate || undefined}
            timePicker={viewTime}
            locale={currentLanguage === 'ar' ? 'ar' : 'en'}
            styles={pickerStyles}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
