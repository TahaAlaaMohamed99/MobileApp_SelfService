import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { IconClose, IconCheckmark, IconUncheck, IconSearch } from '../../assets/IconsSvg';
import AutoFontText from '../AutoFontText';
import TranslationText from '../TranslationText';

/**
 * CustomSelectBottomSheet — Shared BottomSheet component for select/dropdown
 * Supports single/multi selection with searchable options and proper keyboard handling.
 * Uses BottomSheetTextInput for correct iOS/Android keyboard behavior.
 */
export default function CustomSelectBottomSheet({
  sheetRef,
  options = [],
  search,
  setSearch,
  isMulti = false,
  isSelected,
  onSelect,
  onDone,
  isSearchable = true,
  title,
  titleGenerallist = false,
  ResourcePage = '',
}) {
  const {
    colors, spacing, radius, stylesText, text, rowDirection, iconSize, fonts, isRTL,
  } = useDesignSystem();

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => String(o.label ?? '').toLowerCase().includes(lower));
  }, [options, search]);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const renderFooter = useCallback(
    (props) =>
      isMulti ? (
        <BottomSheetFooter {...props} bottomInset={spacing.base}>
          <View style={{ paddingHorizontal: spacing.base }}>
            <TouchableOpacity
              onPress={onDone}
              style={{
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                paddingVertical: spacing.md,
                alignItems: 'center',
              }}
            >
              <TranslationText title="confirm" page="General" style={stylesText({ color: '#fff', size: 'base', weight: 'bold' })} />
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      ) : null,
    [isMulti, spacing, colors, radius, stylesText]
  );

  const snapPoints = useMemo(() => {
    const itemCount = options?.length ||0;
    if (itemCount <= 3) {
      return ['30%', '60%'];
    } else if (itemCount <= 8) {
      return ['50%', '75%'];
    }
    return ['60%', '90%'];
  }, [options]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enableOverDrag={false}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={{ backgroundColor: colors.disabled }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
    >
      <View
        style={{
          flexDirection: 'column',
          gap: spacing.md,
          paddingHorizontal: spacing.base,
          paddingTop: spacing.base,
          marginBottom: spacing.sm,
        }}
      >
        <TranslationText
          titleGenerallist={titleGenerallist}
          title={title}
          page={ResourcePage}
          style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
        />

        {isSearchable && (
          <View
            style={{
              flexDirection: rowDirection,
              alignItems: 'center',
              borderWidth: 1.2,
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              paddingHorizontal: spacing.xs,
              height: 44,
              gap: spacing.xs,
            }}
          >
            <IconSearch color={colors.placeholder} size={iconSize.sm} />
            <BottomSheetTextInput
              style={{
                flex: 1,
                height: 44,
                fontSize: text.md,
                color: colors.title,
                fontFamily: fonts.regular,
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
              value={search}
              onChangeText={setSearch}
              placeholder="search"
              placeholderTextColor={colors.placeholder}
              keyboardType="default"
              returnKeyType="done"
            />
          </View>
        )}
      </View>

      <BottomSheetFlatList
        data={filteredOptions}
        keyExtractor={(item, index) => String(item.value ?? index)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: isMulti ? spacing.xxl + spacing.xl : spacing.lg,
          gap: spacing.xs,
        }}
        showsVerticalScrollIndicator={false}
         renderItem={({ item }) => {
          const selected = isSelected(item);
          const handlePress = () => {
            onSelect(item);
            if (!isMulti) {
              sheetRef.current?.close();
            }
          };
          return (
            <TouchableOpacity
              onPress={handlePress}
              style={{
                flexDirection: rowDirection,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                backgroundColor: selected ? colors.background : 'transparent',
              }}
            >
              <AutoFontText
                value={item.label}
                weight="medium"
                style={{
                  fontSize: text.md,
                  color: selected ? colors.primary : colors.text,
                  flex: 1,
                }}
                numberOfLines={1}
              />
              {selected ? (
                <IconCheckmark color={colors.primary} size={iconSize.base} />
              ) : (
                <IconUncheck color={colors.placeholder} size={iconSize.md} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </BottomSheetModal>
  );
}
