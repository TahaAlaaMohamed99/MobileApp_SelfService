import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { IconEye, IconEyeInvisible } from '../../assets/IconsSvg';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import useTranslationText from '../../hooks/useTranslationText';
import TranslationText from '../TranslationText';

/**
 * CustomInput — mobile input field with label, validation, password toggle.
 * onChange(value, name) — receives the new string value and the field name.
 */
export default function CustomInput({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  onBlur,
  touched,
  errors,
  disabled = false,
  Required = false,
  name,
  ResourcePage = '',
  isNumber = false,
  maxNumber = null,
  style,
  isWhite = false,
  inputStyle,
  leftIcon,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { colors, spacing, text, radius, shadows, fonts, textAlign, rowDirection, writingDirection, currentLanguage, stylesText, globalStyles, iconSize } = useDesignSystem();
  const ReduxResources = useSelector((state) => state.resourcesSlice.ReduxResources);

  const textPlaceholder = useTranslationText({
    page: ResourcePage,
    title: placeholder,
    lang: currentLanguage,
    Resources: ReduxResources,
  });

  const isPassword = type === 'password';

  const handleChangeText = (text) => {
    if (disabled || !onChange) return;
    let val = text;
    if (isNumber) {
      val = text.replace(/\D/g, '');
      if (maxNumber != null && val) val = String(Math.min(+val, maxNumber));
    }
    onChange(val, name);
  };

  const borderColor =
    touched && errors ? colors.error : isFocused ? colors.primary : colors.border;


  const labelRow = {
    flexDirection: rowDirection,
    alignItems: 'center',
    marginBottom: spacing.xs,
  };



  const wrapper = {
    flexDirection: rowDirection,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: disabled ? colors.disabled : borderColor,
    borderRadius: radius.md,
    backgroundColor: disabled ? colors.disabled : isWhite ? colors.surface : colors.background,
    paddingHorizontal: spacing.xs,
    ...shadows.light,
  };

  const inputTxt = {
    flex: 1,
    height: 44,
    fontSize: text.md,
    backgroundColor: disabled ? colors.disabled : isWhite ? colors.surface : colors.background,
    fontFamily: fonts.regular,
    backgroundOpacity: 0,
    color: disabled ? colors.disabledText : colors.title,
    textAlign,
  };

  return (
    <View style={[globalStyles.containerFiled, style,]}>
      {label && (
        <View style={labelRow}>
          <TranslationText title={label} page={ResourcePage} style={[globalStyles.labelTxt]} />
          {Required && (
            <Text style={{ color: colors.primary, fontFamily: fonts.medium }}> *</Text>
          )}
        </View>
      )}

      <View style={wrapper}>
        {leftIcon && <View style={{ paddingHorizontal: spacing.xs }}>{leftIcon}</View>}
        <TextInput
          style={[inputTxt, inputStyle]}
          value={value}
          placeholder={textPlaceholder}
          placeholderTextColor={colors.placeholder}
          onChangeText={handleChangeText}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={isNumber ? 'numeric' : 'default'}
          textAlign={textAlign}
          writingDirection={writingDirection}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={{ padding: spacing.xs }}
          >
            {showPassword
              ? <IconEye color={colors.placeholder} size={iconSize.md} />
              : <IconEyeInvisible color={colors.placeholder} size={iconSize.md} />}
          </TouchableOpacity>
        )}
      </View>

      {touched && errors && (
        <TranslationText title={errors} page={ResourcePage} style={globalStyles.errorTxt} />
      )}
    </View>
  );
}
