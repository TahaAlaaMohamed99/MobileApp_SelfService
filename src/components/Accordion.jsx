import React, { useState } from 'react';
import { Pressable, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import { IconChevronDown } from '../assets/IconsSvg';
import { useDesignSystem } from '../hooks/useDesignSystem';
import AutoFontText from './AutoFontText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabled) {
  UIManager.setLayoutAnimationEnabled(true);
}

const EXPAND_ANIMATION = {
  duration: 200,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

/**
 * Collapsible surface that follows the app design system.
 * `title` can be a string or a React node; use `defaultExpanded` to open it initially.
 */
export default function Accordion({
  title,
  children,
  defaultExpanded = false,
  disabled = false,
  onExpandedChange,
  headerRight,
  style,
  contentStyle,
 }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { colors, spacing, iconSize, rowDirection, globalStyles } = useDesignSystem();

  const toggle = () => {
    if (disabled) return;

    LayoutAnimation.configureNext(EXPAND_ANIMATION);
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <View
      style={[
        globalStyles.card,
        { flexDirection: "column" },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded }}
        disabled={disabled}
        onPress={toggle}
        style={({ pressed }) => [
          {
            flexDirection: rowDirection,
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
           },
        ]}
      >
        <View style={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <AutoFontText value={title} color="title" size="md" weight="medium" numberOfLines={1} />
          ) : (
            title
          )}
        </View>

        {headerRight}
        {!disabled &&
          <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <IconChevronDown color={colors.text} size={iconSize.sm} />
        </View>
        }
      
      </Pressable>

      {expanded && (
        <View
          style={[
            {

              paddingInlineEnd:disabled ? 0 : spacing.xl,
              paddingInlineStart:disabled ? 0 : spacing.md,
              paddingTop: spacing.sm,
              paddingBottom: 0,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}
