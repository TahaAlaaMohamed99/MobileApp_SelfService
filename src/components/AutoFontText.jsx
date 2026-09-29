import React from 'react';
import { Text } from 'react-native';
import { getFontFamily } from '../utils/getFontFamily';
import { useDesignSystem } from '../hooks/useDesignSystem';

// Wraps <Text> for values coming from an API (unknown language ahead of time):
// resolves fontFamily from `value` (Arabic vs Latin) and pulls color/size/weight
// from the design system directly, instead of every call site building
// `style={stylesText({ color, size, weight })}` by hand.
export default function AutoFontText({ value, weight = 'regular', color, size, align, style, numberOfLines, children, ...props }) {
  const { stylesText } = useDesignSystem();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[stylesText({ color, size, weight, align }), style, { fontFamily: getFontFamily(value, weight) }]}
      {...props}
    >
      {children ?? value}
    </Text>
  );
}
