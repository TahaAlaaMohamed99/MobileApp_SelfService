import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';
import AutoFontText from '../AutoFontText';
import CustomeBtn from '../CustomeBtn';
import { IconTimeManagement, IconClose } from '../../assets/IconsSvg';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 3; // 1 above, 1 selected in center, 1 below
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59
const PERIODS = ['AM', 'PM'];

function WheelColumn({ data, selectedValue, onSelect, formatItem, colors, fonts, text, radius }) {
  const flatListRef = useRef(null);
  const isUserScrolling = useRef(false);

  const selectedIndex = useMemo(() => {
    const idx = data.indexOf(selectedValue);
    return idx >= 0 ? idx : 0;
  }, [data, selectedValue]);

  useEffect(() => {
    if (!isUserScrolling.current && flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  const handleScrollEnd = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    isUserScrolling.current = false;
    if (data[clampedIndex] !== undefined && data[clampedIndex] !== selectedValue) {
      onSelect(data[clampedIndex]);
    }
  };

  const getItemLayout = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={{ height: WHEEL_HEIGHT, flex: 1, overflow: 'hidden' }}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled={true}
        bounces={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={selectedIndex}
        contentContainerStyle={{
          paddingVertical: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
        }}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        renderItem={({ item, index }) => {
          const isSelected = item === selectedValue;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                flatListRef.current?.scrollToOffset({
                  offset: index * ITEM_HEIGHT,
                  animated: true,
                });
                onSelect(item);
              }}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: isSelected ? text.xl : text.base,
                  fontFamily: isSelected ? fonts.bold : fonts.medium,
                  color: isSelected ? colors.primary : colors.placeholder,
                  opacity: isSelected ? 1 : 0.45,
                }}
              >
                {formatItem ? formatItem(item) : String(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

/**
 * CustomTimePicker — Mobile wheel time picker component inspired by react-native-timer-picker,
 * seamlessly integrated with @gorhom/bottom-sheet and MegaHR design tokens.
 */
export default function CustomTimePicker({
  label,
  touched,
  errors,
  Required = false,
  onBlur,
  onChange,
  value = '09:00:00',
  disabled = false,
  ResourcePage = 'GeneralField',
  style,
}) {
  const { colors, spacing, radius, shadows, fonts, text, textAlign, rowDirection, stylesText, globalStyles, iconSize } =
    useDesignSystem();

  const sheetRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse input time into { hour12, minutes, isPM }
  const parsedTime = useMemo(() => {
    let hours = 9;
    let minutes = 0;
    if (typeof value === 'string' && value.includes(':')) {
      const parts = value.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else if (value instanceof Date) {
      hours = value.getHours();
      minutes = value.getMinutes();
    }
    const isPM = hours >= 12;
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return { hour12, minutes, isPM };
  }, [value]);

  const [pendingHour, setPendingHour] = useState(parsedTime.hour12);
  const [pendingMinute, setPendingMinute] = useState(parsedTime.minutes);
  const [pendingPeriod, setPendingPeriod] = useState(parsedTime.isPM ? 'PM' : 'AM');

  const displayString = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    const amPmStr = parsedTime.isPM ? 'PM' : 'AM';
    return `${pad(parsedTime.hour12)}:${pad(parsedTime.minutes)} ${amPmStr}`;
  }, [parsedTime]);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const openSheet = () => {
    if (disabled) return;
    setPendingHour(parsedTime.hour12);
    setPendingMinute(parsedTime.minutes);
    setPendingPeriod(parsedTime.isPM ? 'PM' : 'AM');
    setIsFocused(true);
    sheetRef.current?.present();
  };

  const handleConfirm = () => {
    let h24 = pendingHour % 12;
    if (pendingPeriod === 'PM') h24 += 12;
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(h24)}:${pad(pendingMinute)}:00`;
    onChange?.(timeStr);
    sheetRef.current?.dismiss();
  };

  const handleDismiss = () => {
    setIsFocused(false);
    onBlur?.();
  };

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
          backgroundColor: disabled ? colors.disabled : colors.background,
          paddingHorizontal: spacing.sm,
          height: 44,
          gap: spacing.xs,
          ...shadows.light,
        }}
      >
        <AutoFontText
          value={displayString}
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: text.md,
            color: disabled ? colors.disabledText : colors.title,
            textAlign,
          }}
        />

        <IconTimeManagement color={colors.text} size={iconSize.sm} />
      </TouchableOpacity>

      {touched && errors && <TranslationText title={errors} page={ResourcePage} style={globalStyles.errorTxt} />}

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        enableDynamicSizing
        enableContentPanningGesture={false}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={{ padding: spacing.base, paddingBottom: spacing.xxl }}>
          {/* Header */}
          <View
            style={{
              flexDirection: rowDirection,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.base,
            }}
          >
            <TranslationText title={label || 'time'} page={ResourcePage} style={stylesText({ color: 'title', size: 'base', weight: 'bold' })} />
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
              <IconClose color={colors.placeholder} size={iconSize.md} />
            </TouchableOpacity>
          </View>

          {/* Wheel Picker Container */}
          <View
            style={{
              height: WHEEL_HEIGHT,
              marginVertical: spacing.md,
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Center Selection Highlight Bar */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: spacing.sm,
                right: spacing.sm,
                top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
                height: ITEM_HEIGHT,

              }}
            />

            {/* Hours Column */}
            <WheelColumn
              data={HOURS}
              selectedValue={pendingHour}
              onSelect={setPendingHour}
              formatItem={(h) => String(h).padStart(2, '0')}
              colors={colors}
              fonts={fonts}
              text={text}
              radius={radius}
            />

            {/* Colon Separator */}
            <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xs }}>
              <Text style={{ fontSize: text.xl, fontFamily: fonts.bold, color: colors.title }}>:</Text>
            </View>

            {/* Minutes Column */}
            <WheelColumn
              data={MINUTES}
              selectedValue={pendingMinute}
              onSelect={setPendingMinute}
              formatItem={(m) => String(m).padStart(2, '0')}
              colors={colors}
              fonts={fonts}
              text={text}
              radius={radius}
            />

            {/* Period Column (AM / PM) */}
            <WheelColumn
              data={PERIODS}
              selectedValue={pendingPeriod}
              onSelect={setPendingPeriod}
              colors={colors}
              fonts={fonts}
              text={text}
              radius={radius}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: rowDirection, gap: spacing.base, marginTop: spacing.md }}>
            <CustomeBtn
              title="cancel"
              type="cancel"
              size="btn_md"
              style={{ flex: 1 }}
              ResourcePage="GeneralActions"
              onPress={() => sheetRef.current?.dismiss()}
            />
            <CustomeBtn
              title="confirm"
              type="primary"
              size="btn_md"
              style={{ flex: 1 }}
              ResourcePage="GeneralActions"
              onPress={handleConfirm}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
