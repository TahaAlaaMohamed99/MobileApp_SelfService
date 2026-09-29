import React, { useMemo } from "react";
import { View, Text, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import { useRefreshControlProps } from "../../hooks/useRefreshControlProps";
import ShiftCard from "./ShiftCard";
import StatusIndicators from "./StatusIndicators";
import DayStatusBadges from "./DayStatusBadges";
import { getDayShifts } from "./shiftPalette";

export default function AgendaListView({ month, data, refreshing, onRefresh }) {
  const { colors, spacing, stylesText, rowDirection, iconSize } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const days = useMemo(() => {
    const startOfPeriod = data?.[0]?.childDate ? dayjs(data[0].childDate) : month.startOf("month");
    const totalDays = data?.length || month.daysInMonth();
    return Array.from({ length: totalDays }, (_, i) => startOfPeriod.add(i, "day"));
  }, [month, data]);

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} {...refreshControlProps} />
      }
      data={days}
      keyExtractor={(date) => date.format("YYYY-MM-DD")}
      renderItem={({ item: date }) => {
        const dateKey = date.format("YYYY-MM-DD");
        const dayRecord = data?.find((d) => d.childDate === dateKey);
        const shifts = getDayShifts(dayRecord);

        return (
          <View>
            <View style={{ flexDirection: rowDirection, paddingVertical: spacing.sm }}>
              <View style={{ width: 56 }}>
                <Text style={stylesText({ color: "text", size: "sm", weight: "medium" })}>
                  {date.format("ddd")}
                </Text>
                <Text style={stylesText({ color: "title", size: "xl", weight: "bold" })}>
                  {date.date()}
                </Text>

              </View>

              <View style={{ flex: 1, justifyContent: "center" }}>
                <DayStatusBadges dayRecord={dayRecord} />
                {shifts.map((shift) => (
                  <ShiftCard key={shift.key} shift={shift} />
                ))}
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />
          </View>
        );
      }}
    />
  );
}
