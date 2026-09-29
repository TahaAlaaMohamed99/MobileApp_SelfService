import React from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';


const LOADING_LABEL = { save: 'loadingSave', edit: 'loadingEdit' };

/**
 * CustomeBtn — reusable button with loading state and translation support.
 * type: 'primary' | 'secondary' | 'danger' | 'outline'
 * size: 'btn_sm' | 'btn_md' | 'btn_lg'
 */
export default function CustomeBtn({
  title,
  onPress,
  type = 'primary',
  size = 'btn_lg',
  icon,
  disabled = false,
  isLoading = false,
  ResourcePage = 'General',
  style,
  textStyle,
}) {
  const { colors, radius, currentShadow, fonts, rowDirection, text } = useDesignSystem();

  const SIZE_MAP = {
    btn_sm: { height: 32, paddingHorizontal: 12, fontSize: text.sm, weight: 'medium' },
    btn_md: { height: 40, paddingHorizontal: 16, fontSize: text.md, weight: 'semiBold' },
    btn_lg: { height: 48, paddingHorizontal: 20, fontSize: text.base, weight: 'semiBold' },
  };
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.btn_lg;

  const palette = {
    primary: { bg: colors.primary, text: '#F0F4FF', border: colors.primary },
    secondary: { bg: colors.surface, text: colors.primary, border: colors.border },
    danger: { bg: colors.error, text: '#F0F4FF', border: colors.error },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    cancel: { bg: colors.border, text: colors.text, border: colors.border }
  };
  const c = palette[type] ?? palette.primary;

  const btnStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: disabled ? colors.disabled : c.border,
    backgroundColor: disabled ? colors.disabled : c.bg,
    flexDirection: rowDirection,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...currentShadow,
  };

  const labelStyle = {
    fontSize: sizeConfig.fontSize,
    fontFamily: fonts[sizeConfig.weight],
    // Keep 'normal': fontWeight on top of a custom fontFamily breaks the
    // Cairo/Roboto lookup on Android and falls back to the system font.
    fontWeight: 'normal',
    color: disabled ? colors.disabledText : c.text,
  };

  return (
    <TouchableOpacity
      style={[btnStyle, style]}
      onPress={() => { if (!disabled && !isLoading && onPress) onPress(); }}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={c.text} />
          {title && (
            <TranslationText
              page={ResourcePage}
              title={LOADING_LABEL[title] ?? 'loading'}
              style={[labelStyle, textStyle]}
            />
          )}
        </>
      ) : (
        <>
          {icon && <View>{icon}</View>}
          {title && (
            <TranslationText
              page={ResourcePage}
              title={title}
              style={[labelStyle, textStyle]}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
