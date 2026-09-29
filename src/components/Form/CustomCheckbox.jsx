import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IconCheck } from '../../assets/IconsSvg';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';

export default function CustomCheckbox({
  value,
  label,
  onChange,
  checked,
  ResourcePage = '',
  sublabel = null,
  disabled = false,
  size = 20,
  style,
  checkboxStyle,
  isWhite = false

}) {
  const { colors, spacing, radius, fonts, rowDirection, globalStyles, stylesText } = useDesignSystem();

  const isChecked = checked != null ? checked : value === true;

  const container = {
    flexDirection: rowDirection,
    alignItems: 'center',
    gap: spacing.sm,
  };
   const box = {
    width: size,
    height: size,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: disabled ? colors.disabled : isChecked ? colors.primary : colors.border,
    backgroundColor: disabled ? colors.disabled : isChecked ? colors.primary : colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelTxt = {
    ...globalStyles.labelTxt,
    color: disabled ? colors.disabledText : globalStyles.labelTxt.color,
  };

  const sublabelTxt = {
    fontSize: size - 8,
    fontFamily: fonts.regular,
    color: disabled ? colors.disabledText : colors.text,
  };

  return (
    <TouchableOpacity
      style={[container, style]}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange && onChange(!isChecked, value)}
    >
      <View style={[box, checkboxStyle]}>
        {isChecked && <IconCheck color={"#F0F4FF"} size={size / 0.95} />}
      </View>
      {label && (
        <View>
          {sublabel && <TranslationText title={sublabel} page={ResourcePage} style={sublabelTxt} />}
          <TranslationText title={label} page={ResourcePage} style={labelTxt} />
        </View>
      )}
    </TouchableOpacity>
  );
}
