import React from 'react';
import { View } from 'react-native';
import TranslationText from './TranslationText';
import AutoFontText from './AutoFontText';
import { useDesignSystem } from '../hooks/useDesignSystem';
import useFormatNumber from '../utils/useFormatNumber';

export default function CardCounter({ ResourcePage, title, counter, icon, type, style, isDisabled = false }) {
  const { colors, spacing, radius, stylesText, rowDirection } = useDesignSystem();

  return (
    <View
      style={[
        {
          borderWidth: 1.2,
          flexDirection: rowDirection,
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: isDisabled ? colors.disabled : colors.background,
          padding: spacing.sm,
          gap: 4,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
        {icon}
        <TranslationText
          page={ResourcePage}
          title={title}
          style={stylesText({ color: isDisabled ? 'disabledText' : 'title', size: 'md', weight: 'medium' })}
        />
      </View>

      <AutoFontText
        value={type === 'number' ? useFormatNumber(counter) : counter}
        color={isDisabled ? 'disabledText' : 'primary'}
        size="base"
        weight="bold"
      />
    </View>
  );
}
