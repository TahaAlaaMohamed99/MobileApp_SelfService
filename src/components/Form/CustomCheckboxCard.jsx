import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IconCheck } from '../../assets/IconsSvg';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';

export default function CustomCheckboxCard({
  value,
  label,
  onChange,
  checked,
  ResourcePage = '',
  disabled = false,
  size = 20,
  style,
}) {
  const { colors, spacing, radius, rowDirection, stylesText } = useDesignSystem();

  const isChecked = checked != null ? checked : value === true;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange && onChange(!isChecked, value)}
      style={[
        {
          flexDirection: rowDirection,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1.2,
          borderColor: disabled ? colors.disabled : colors.primary,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.disabled : colors.background,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
        },
        style,
      ]}
    >
      <TranslationText
        title={label}
        page={ResourcePage}
        style={stylesText({ color: disabled ? 'disabledText' : 'primary', size: 'md', weight: 'semiBold' })}
      />

      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius.sm,
          backgroundColor: isChecked ? colors.primary : colors.surface,
          opacity: disabled ? 0.65 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isChecked && <IconCheck color="#F0F4FF" size={size / 0.95} />}
      </View>
    </TouchableOpacity>
  );
}
