import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import useTranslationText from '../../hooks/useTranslationText';
import TranslationText from '../TranslationText';
import { IconChevronDown, IconClose } from '../../assets/IconsSvg';
import AutoFontText from '../AutoFontText';
import CustomSelectBottomSheet from '../Shared/CustomSelectBottomSheet';

/**
 * CustomSelect — mobile select/dropdown field (BottomSheetModal picker) with
 * label, validation and translations, matching CustomInput's conventions.
 * Supports single or multi selection. options: [{ value, label }].
 * onChange(option | option[] | null, name)
 */
export default function CustomSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  isMulti = false,
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  touched,
  errors,
  Required = false,
  name,
  ResourcePage = '',
  titleGenerallist = false,
  isWhite = false,
  style,
}) {
  const {
    colors, spacing, radius, shadows, fonts, text,
    textAlign, rowDirection,
    currentLanguage, stylesText, globalStyles, iconSize,
  } = useDesignSystem();
  const ReduxResources = useSelector((state) => state.resourcesSlice.ReduxResources);

  const sheetRef = useRef(null);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState([]);

  const textPlaceholder = useTranslationText({
    page: ResourcePage,
    title: placeholder,
    lang: currentLanguage,
    Resources: ReduxResources,
  });
  const selectedValues = isMulti ? (value || []) : value ? [value] : [];
  const hasValue = selectedValues.length > 0;
  const displayText = isMulti ? selectedValues.map((o) => o.label).join(', ') : value?.label;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => String(o.label ?? '').toLowerCase().includes(lower));
  }, [options, search]);


  const openSheet = () => {
    if (isDisabled) return;
    setPending(selectedValues);
    setSearch('');
    sheetRef.current?.present();
  };

  const handleSelect = (option) => {
    if (!isMulti) {
      onChange?.(option, name);
      sheetRef.current?.dismiss();
      return;
    }
    setPending((prev) => {
      const exists = prev.some((o) => o.value === option.value);
      return exists ? prev.filter((o) => o.value !== option.value) : [...prev, option];
    });
  };

  const handleDone = () => {
    onChange?.(pending, name);
    sheetRef.current?.dismiss();
  };

  const handleClear = () => onChange?.(isMulti ? [] : null, name);

  const isSelected = (option) => (isMulti ? pending : selectedValues).some((o) => o.value === option.value);

  const borderColor = touched && errors ? colors.error : colors.border;


  return (
    <View style={[globalStyles.containerFiled, style]}>
      {label && (
        <View style={{ flexDirection: rowDirection, alignItems: 'center', marginBottom: spacing.xs }}>
          <TranslationText titleGenerallist={titleGenerallist} title={label} page={ResourcePage} style={globalStyles.labelTxt} />
          {Required && <Text style={{ color: colors.primary, fontFamily: fonts.medium }}> *</Text>}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openSheet}
        disabled={isDisabled}
        style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          borderWidth: 1.2,
          borderColor: isDisabled ? colors.disabled : borderColor,
          borderRadius: radius.md,
          backgroundColor: isDisabled ? colors.disabled : isWhite ? colors.surface : colors.background,
          paddingHorizontal: spacing.sm,
          height: 44,
          ...shadows.light,
        }}
      >
        <AutoFontText
          value={hasValue ? displayText : textPlaceholder}
          weight="medium"
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: text.md,
            color: hasValue ? (isDisabled ? colors.disabledText : colors.title) : colors.placeholder,
            textAlign,
          }}
        />

        {isClearable && hasValue && !isDisabled && (
          <TouchableOpacity onPress={handleClear} style={{ padding: spacing.xs }}>
            <IconClose color={colors.placeholder} size={iconSize.sm} />
          </TouchableOpacity>
        )}

        <IconChevronDown color={colors.text} size={iconSize.sm} />
      </TouchableOpacity>

      {touched && errors && (
        <TranslationText titleGenerallist={titleGenerallist} title={errors} page={ResourcePage} style={globalStyles.errorTxt} />
      )}

      <CustomSelectBottomSheet
        sheetRef={sheetRef}
        options={filteredOptions}
        search={search}
        setSearch={setSearch}
        isMulti={isMulti}
        isSelected={isSelected}
        onSelect={handleSelect}
        onDone={handleDone}
        isSearchable={isSearchable}
        title={label}
        titleGenerallist={titleGenerallist}
        ResourcePage={ResourcePage}
      />
    </View>
  );
}
