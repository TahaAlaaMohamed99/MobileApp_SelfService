import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';

const VARIANTS = {
  danger: { bgKey: 'errorTint', borderColor: 'transparent', iconColor: 'error', textColor: 'error' },
  outline: { bgKey: 'surface', borderColor: 'title', iconColor: 'title', textColor: 'title' },
  primary: { bgKey: 'primary', borderColor: 'primary', iconColor: '#F0F4FF', textColor: '#F0F4FF' },
};

/**
 * FooterActionButton — action button used by FooterActions.
 * variant: 'danger' (icon-only tinted square) | 'outline' (bordered, icon+label) | 'primary' (filled, icon+label)
 * Omit `title` for an icon-only square button (used for the delete action).
 */
export default function FooterActionButton({
  variant = 'outline',
  icon: Icon,
  title,
  isLoading = false,
  disabled = false,
  onPress,
  ResourcePage = 'General',
}) {
  const { colors, spacing, radius, iconSize, fonts, text, rowDirection, globalStyles, currentShadow } =
    useDesignSystem();

  const v = VARIANTS[variant] ?? VARIANTS.outline;
  const iconColor = colors[v.iconColor] ?? v.iconColor;
  const textColor = colors[v.textColor] ?? v.textColor;
  const backgroundColor = v.bgKey === 'errorTint' ? `${colors.error}1A` : colors[v.bgKey];
  const isIconOnly = !title;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={
        isIconOnly
          ? [globalStyles.btnHeaderActions, { backgroundColor, opacity: disabled ? 0.6 : 1 }]
          : [
              {
                 flexDirection: rowDirection,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.base,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors[v.borderColor] ?? v.borderColor,
                backgroundColor,
                opacity: disabled ? 0.6 : 1,
                ...currentShadow,
              },
            ]
      }
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {Icon && <Icon color={iconColor} size={isIconOnly ? iconSize.lg : iconSize.sm} />}
          {title && (
            <TranslationText
              page={ResourcePage}
              title={title}
              style={{
                color: textColor,
                fontSize: text.base,
                fontFamily: fonts.semiBold,
                fontWeight: 'normal',
              }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
