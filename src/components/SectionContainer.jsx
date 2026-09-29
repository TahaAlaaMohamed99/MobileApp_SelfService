import React, { Children } from 'react';
import { View } from 'react-native';
import TranslationText from './TranslationText';
import { useDesignSystem } from '../hooks/useDesignSystem';

/**
 * SectionContainer — bordered card with a floating title label, matching
 * the web version's "legend" style section wrapper. isTwoColumns lays
 * children out two-per-row on tablet width and up (stacked on phones).
 */
export default function SectionContainer({
  title,
  titleExtra,
  children,
  ResourcePage,
  isTwoColumns = false,
  isModal = false,
  style,
}) {
  const { colors, spacing, radius, currentShadow, stylesText, rowDirection, isRTL, isTablet, isLargeTablet } = useDesignSystem();

  const useTwoColumns = isTwoColumns && (isTablet || isLargeTablet);
  const childArray = Children.toArray(children);

  return (
    <View style={[{ marginTop: spacing.md + 4, marginBottom: spacing.lg }, style]}>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          backgroundColor: isModal ? colors.background : colors.surface,
          padding: spacing.base,
          paddingTop: spacing.xxl,
          ...currentShadow,
        }}
      >
        <View
          style={{
            flexDirection: rowDirection,
            flexWrap: 'wrap',
            gap: spacing.sm,
            ...(useTwoColumns ? { justifyContent: 'space-between' } : {}),
          }}
        >
          {childArray.map((child, index) => (
            <View key={index} style={useTwoColumns ? { width: '48%' } : { width: '100%' }}>
              {child}
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          top: isRTL ? -20 : - 12,
          insetInlineStart: spacing.md,
          flexDirection: rowDirection,
          alignItems: 'baseline',
          gap: spacing.xs,
        }}
      >
        <TranslationText
          page={ResourcePage}
          title={title}
          style={stylesText({ color: 'title', size: 'lg', weight: 'bold' })}
        />
        {titleExtra}
      </View>
    </View>
  );
}
