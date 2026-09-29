import React from "react";
import { View } from "react-native";
import { useDesignSystem } from "../../hooks/useDesignSystem";
import { getStatusColor } from "./shiftPalette";

export default function StatusIndicators({ day, rowData, size = 8 }) {
  const { rowDirection } = useDesignSystem();

  if (!rowData) return null;

  const dotStyle = (type) => ({
    width: size,
    height: size,
    borderRadius: size / 4,
    backgroundColor: getStatusColor(type),
  });

  return (
    <View style={{ flexDirection: rowDirection, gap: 2, flexWrap: "wrap", justifyContent: "flex-start", marginBottom: 2 }}>
      {rowData?.isWeekEnd === 2 && <View style={dotStyle("weekend")} />}
      {rowData?.holidayId > 0 && <View style={dotStyle("holiday")} />}
      {rowData?.hasMission === 2 && <View style={dotStyle("mission")} />}
      {rowData?.hasPartialLeave === 2 && <View style={dotStyle("partialLeave")} />}
      {rowData?.hasVacation === 2 && <View style={dotStyle("vacation")} />}
      {rowData?.sourceType === 5 && <View style={dotStyle("WorkPartTime")} />}
      {rowData?.sourceType === 6 && <View style={dotStyle("ExtraWorkWeekend")} />}
      {rowData?.sourceType === 7 && <View style={dotStyle("ExtraWorkHoliday")} />}
    </View>
  );
}
