import React from 'react';
import { View } from 'react-native';
import TranslationText from './TranslationText';

export function StatusNewCell({ title, ResourcePage, column, colors, spacing, radius, stylesText }) {
  const statusColor = column.color && column.color.startsWith('#')
    ? column.color
    : (column.color ? colors[column.color] : colors.text);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: `${statusColor}20`,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: radius.sm,
          backgroundColor: statusColor,
        }}
      />
      <TranslationText
        title={title}
        page={ResourcePage}
        weight="medium"
        style={[
          stylesText({ color: statusColor, size: 'sm', weight: 'bold' }),
          { textTransform: 'capitalize' },
        ]}
        numberOfLines={1}
      />
    </View>
  );
}
