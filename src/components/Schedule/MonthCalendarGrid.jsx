import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import TranslationText from "../TranslationText";
import BottomSheetModalViwer from "../BottomSheetModalViwer";
import ShiftsBadge from "./ShiftsBadge";
import ShiftCard from "./ShiftCard";
import StatusIndicators from "./StatusIndicators";
import DayStatusBadges, { getDayBadges } from "./DayStatusBadges";
import { getDayShifts } from "./shiftPalette";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const TODAY_KEY = dayjs().format("YYYY-MM-DD");

export default function MonthCalendarGrid({ month, data }) {
  const { colors, spacing, radius, stylesText, rowDirection, isRTL, width } = useDesignSystem();
  const [openDateKey, setOpenDateKey] = useState(null);
  const cellSize = (width - spacing.base * 2) / 7;
  const bottomSheetRef = useRef(null);

  const weeks = useMemo(() => {
    const startOfPeriod = data?.[0]?.childDate ? dayjs(data[0].childDate) : month.startOf("month");
    const totalDays = data?.length || month.daysInMonth();
    const startWeekday = startOfPeriod.day();
    const totalCells = Math.ceil((startWeekday + totalDays) / 7) * 7;

    const days = Array.from({ length: totalCells }, (_, i) => {
      const dayOffset = i - startWeekday;
      return {
        date: startOfPeriod.add(dayOffset, "day"),
        isOtherMonth: dayOffset < 0 || dayOffset >= totalDays,
      };
    });

    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [month, data]);

  const selectedDayRecord = useMemo(() => {
    if (!openDateKey) return null;
    return data?.find((d) => d.childDate === openDateKey);
  }, [openDateKey, data]);

  const selectedShift = useMemo(() => {
    if (!selectedDayRecord) return [];
    return getDayShifts(selectedDayRecord);
  }, [selectedDayRecord]);

  const dayBadges = useMemo(() => {
    return getDayBadges(selectedDayRecord);
  }, [selectedDayRecord]);

  const snapPoints = useMemo(() => {
    const shiftCount = selectedShift?.length || 0;
    const hasBadges = dayBadges.length > 0;
    if (shiftCount > 2) return ["42%", "60%"];
    if (shiftCount === 2) return hasBadges ? ["38%", "50%"] : ["32%"];
    if (shiftCount === 1) return hasBadges ? ["28%", "38%"] : ["20%"];
    return hasBadges ? ["24%"] : ["18%"];
  }, [selectedShift, dayBadges]);

  const openDay = (dateKey) => {
    setOpenDateKey(dateKey);
    bottomSheetRef.current?.present();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: rowDirection }}>
        {WEEKDAYS.map((label, index) => (
          <View key={index} style={{ width: cellSize, alignItems: "flex-start", paddingBottom: spacing.xs, marginHorizontal: 2 }}>
            <TranslationText
              page="Schedule"
              title={label}
              style={stylesText({ color: "text", size: "sm", weight: "bold" })}
            />
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flex: 1, flexDirection: rowDirection }}>
            {week.map(({ date, isOtherMonth }, dayIndex) => {
              const dateKey = date.format("YYYY-MM-DD");
              const dayRecord = data?.find((d) => d.childDate === dateKey);
              const isSelected = openDateKey === dateKey;
              const isToday = dateKey === TODAY_KEY;
              return (
                <TouchableOpacity
                  key={dateKey}
                  onPress={() => openDay(dateKey)}
                  style={{
                    width: cellSize,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    paddingTop: spacing.xs,
                    borderColor: colors.border,
                    borderEndWidth: 1,
                    borderStartWidth: dayIndex === 0 ? 1 : 0,
                    borderTopWidth: weekIndex === 0 ? 1 : 0,
                    borderBottomWidth: 1,
                    paddingHorizontal: 3
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: radius?.md,
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      backgroundColor: isToday ? colors.primary : "transparent",
                      borderWidth: isToday && !isSelected ? 1.5 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text
                      style={[
                        stylesText({
                          color: isSelected
                            ? colors.surface
                            : isOtherMonth
                              ? "disabledText"
                              : isToday ? "#fff" : "title",
                          size: "sm",
                          weight: "bold",
                        }),
                      ]}
                    >
                      {!isOtherMonth && date.date()}
                    </Text>
                  </View>

                  {!isOtherMonth && (
                    <View style={{ marginTop: 3, width: "100%" }}>
                      <StatusIndicators
                        day={{ isWeekend: date.day() === 0 || date.day() === 6 }}
                        rowData={dayRecord}
                      />
                      <ShiftsBadge dayData={dayRecord} />

                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <BottomSheetModalViwer
        ref={bottomSheetRef}
        data={selectedShift}
        snapPoints={snapPoints}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View>
            <ShiftCard shift={item} />
          </View>
        )}
        ListHeaderComponent={
          openDateKey ? (
            <View style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
              <Text style={stylesText({ color: "title", size: "lg", weight: "bold" })}>
                {dayjs(openDateKey).format("dddd, D MMMM")}
              </Text>
              {selectedDayRecord && <DayStatusBadges dayRecord={selectedDayRecord} />}
            </View>
          ) : null
        }
        onDismiss={() => setOpenDateKey(null)}
      />
    </View>
  );
}
