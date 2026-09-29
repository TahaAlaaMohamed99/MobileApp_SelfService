import React from "react";
import { View, Text } from "react-native";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import { formatShiftTimeRange } from "./shiftPalette";

export default function ShiftCard({ shift }) {
  const { spacing, radius, stylesText, rowDirection, isRTL, iconSize } = useDesignSystem();
  const { Icon, bg, fg, time } = shift;
  const shiftName = shift?.[`${shift.key}Name`] || shift?.name;

  return (
    <View
      style={{
        flexDirection: rowDirection,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: bg,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: rowDirection, alignItems: "center", gap: spacing.sm }}>
        {Icon && <Icon color={fg} size={iconSize.md} />}
        {shiftName ? (
          <Text style={stylesText({ color: fg, size: "md", weight: "bold" })}>
            {shiftName}
          </Text>
        ) : null}
      </View>
      <Text style={stylesText({ color: fg, size: "md", weight: "medium" })}>
        {formatShiftTimeRange(time, isRTL)}
      </Text>
    </View>
  );
}
