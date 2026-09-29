import React from "react";
import { View, Text } from "react-native";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import { getDayShifts, formatShiftTimeRange } from "./shiftPalette";

const VISIBLE_SHIFTS = 2;

export default function ShiftsBadge({ dayData }) {
  const { spacing, radius, stylesText, isRTL, iconSize } = useDesignSystem();
  const shifts = getDayShifts(dayData);

  return (
    <View style={{ gap: spacing.xs / 1.2 }}>
      {shifts.slice(0, VISIBLE_SHIFTS).map(({ key, Icon, bg, fg, time }) => (
        <View
          key={key}
          style={{
            alignSelf: "stretch",
            backgroundColor: bg,
            padding: 2,
            borderRadius: radius?.sm,
          }}
        >
          {Icon && <Icon color={fg} size={iconSize.xs} />}
          <Text numberOfLines={1} style={stylesText({ color: fg, size: "xxs", weight: "medium" })}>
            {formatShiftTimeRange(time, isRTL)}
          </Text>
        </View>
      ))}
      {shifts.length > VISIBLE_SHIFTS && (
        <Text style={stylesText({ color: "title", size: "xxs", weight: "medium" })}>
          +{shifts.length - VISIBLE_SHIFTS} more
        </Text>
      )}
    </View>
  );
}
