import React from "react";
import { View, Text } from "react-native";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import TranslationText from "../TranslationText";
import { getStatusColor } from "./shiftPalette";

export const getDayBadges = (dayRecord) => {
  if (!dayRecord) return [];
  const badges = [];

  if (dayRecord.hasVacation === 2) {
    badges.push({
      key: "vacation",
      title: "Vacation",
      page: "General",
      color: getStatusColor("vacation"),
    });
  }

  if (dayRecord.hasMission === 2) {
    badges.push({
      key: "mission",
      title: "title",
      page: "Mission",
      color: getStatusColor("mission"),
    });
  }

  if (dayRecord.hasPartialLeave === 2) {
    badges.push({
      key: "partialLeave",
      title: "title",
      page: "PartialDayLeave",
      color: getStatusColor("partialLeave"),
    });
  }

  if (dayRecord.hasException === 2) {
    badges.push({
      key: "exception",
      title: "title",
      page: "AttendanceException",
      color: getStatusColor("exception"),
    });
  }

  if (dayRecord.holidayId > 0 || dayRecord.holidayName) {
    badges.push({
      key: "holiday",
      title: dayRecord.holidayName ? null : "holiday",
      rawText: dayRecord.holidayName || null,
      page: "General",
      color: getStatusColor("holiday"),
    });
  }

  if (dayRecord.isWeekEnd === 2) {
    badges.push({
      key: "weekend",
      title: "weekend",
      page: "General",
      color: getStatusColor("weekend"),
    });
  }

  if (dayRecord.sourceType === 5) {
    badges.push({
      key: "WorkPartTime",
      title: "title",
      page: "WorkPartTime",
      color: getStatusColor("WorkPartTime"),
    });
  }

  if (dayRecord.sourceType === 6) {
    badges.push({
      key: "ExtraWorkWeekend",
      title: "title",
      page: "ExtraWorkWeekend",
      color: getStatusColor("ExtraWorkWeekend"),
    });
  }

  if (dayRecord.sourceType === 7) {
    badges.push({
      key: "ExtraWorkHoliday",
      title: "title",
      page: "ExtraWorkHoliday",
      color: getStatusColor("ExtraWorkHoliday"),
    });
  }

  return badges;
};

export default function DayStatusBadges({ dayRecord, style }) {
  const { spacing, radius, stylesText, rowDirection } = useDesignSystem();
  const badges = getDayBadges(dayRecord);

  if (!badges.length) return null;

  return (
    <View style={[{ flexDirection: rowDirection, flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs }, style]}>
      {badges.map((b) => (
        <View
          key={b.key}
          style={{
            flexDirection: rowDirection,
            alignItems: "center",
            gap: spacing.xs / 1.5,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs / 1.5,
            backgroundColor: `${b.color}20`,
            borderRadius: radius.sm,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: b.color,
            }}
          />
          {b.rawText ? (
            <Text
              style={[
                stylesText({ color: b.color, size: "sm", weight: "bold" }),
                { textTransform: "capitalize" },
              ]}
              numberOfLines={1}
            >
              {b.rawText}
            </Text>
          ) : (
            <TranslationText
              title={b.title}
              page={b.page}
              style={[
                stylesText({ color: b.color, size: "sm", weight: "bold" }),
                { textTransform: "capitalize" },
              ]}
              numberOfLines={1}
            />
          )}
        </View>
      ))}
    </View>
  );
}
