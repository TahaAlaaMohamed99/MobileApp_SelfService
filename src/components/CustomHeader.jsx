import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';

/**
 * CustomHeader — screen header with back button and optional right actions.
 *
 * rightActions: [{ icon: <Ionicons name="..." size={22} />, onPress: fn, disabled: bool }]
 */
export default function CustomHeader({
  title,
  page,
  onBack,
  rightActions = [],
  showBack = true,
  backgroundColor,
  style,
}) {
  const { colors, spacing, text, shadows, isRTL, textAlign, rowDirection, fonts, iconSize } = useDesignSystem();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor ?? colors.surface;
  const backIcon = isRTL ? 'chevron-forward' : 'chevron-back';

  const header = {
    paddingTop: insets.top + spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: bgColor,
    flexDirection: rowDirection,
    alignItems: 'center',
    ...shadows.light,
  };

  const titleStyle = {
    fontSize: text.lg,
    fontFamily: fonts.bold,
    color: colors.title,
    textAlign,
  };

  const backBtn = {
    padding: spacing.xs,
    marginEnd: spacing.sm,
  };

  const actionsRow = {
    flexDirection: rowDirection,
    alignItems: 'center',
    gap: spacing.xs,
  };

  return (
    <View style={[header, style]}>
      {showBack && onBack && (
        <TouchableOpacity style={backBtn} onPress={onBack}>
          <Ionicons name={backIcon} size={iconSize.lg} color={colors.title} />
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }}>
        {title ? (
          <TranslationText title={title} page={page} style={titleStyle} />
        ) : null}
      </View>

      {rightActions.length > 0 && (
        <View style={actionsRow}>
          {rightActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={action.onPress}
              disabled={action.disabled}
              style={{ padding: spacing.xs }}
            >
              {action.icon}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
