import { View, Text } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { formatTimeAndPeriod, formatDayMonth, formatDateMonthShort, formatWeekday } from '../../hooks/useFormatDate';
import TranslationText from '../TranslationText';
import { IconLocation, IconTimeManagement, IconCheckOut, IconCalendarSmall, IconWarning, IconUser, IconFingerPrint, IconExcel } from '../../assets/IconsSvg';
import AutoFontText from '../AutoFontText';
import { StatusNewCell } from '../StatusNewCell';
import { STATUS_COLOR_LIST, getStatusColor } from '../Schedule/shiftPalette';

function formatDurationHM(value) {
  if (!value) return '0h 0m';
  const [h, m] = value.split(':');
  const totalMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

const FINGERPRINT_TYPE_CONFIG = {
  1: { Icon: IconUser, labelPage: 'Generallist?.FingerPrintType?.values', labelKey: 'UserInput' },
  2: { Icon: IconExcel, labelPage: 'Generallist?.FingerPrintType?.values', labelKey: 'Excel' },
  3: { Icon: IconLocation, labelPage: 'Branch', labelKey: 'title' },
  4: { Icon: IconFingerPrint, labelPage: 'Generallist?.FingerPrintType?.values', labelKey: 'Machine' },
};

function StatRow({ Icon, labelPage, labelKey, subtitle, value }) {
  const { colors, spacing, stylesText, iconSize, rowDirection } = useDesignSystem();
  return (
    <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2 }}>
      <Icon color={colors.text} size={iconSize.xs} />
      <TranslationText page={labelPage} title={labelKey} style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })} />
      {subtitle && (
        <Text style={stylesText({ color: 'title', size: 'xs', weight: 'medium' })}>
          ({subtitle})
        </Text>
      )}
      {value && (
        <>
          <Text style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })}>:</Text>
          <AutoFontText value={value} color="title" size="sm" weight="medium" />
        </>
      )}

    </View>
  );
}

function TimeBlock({ labelKey, rotate, time, showDate }) {
  const { colors, spacing, stylesText, iconSize } = useDesignSystem();
  return (
    <View style={{ gap: spacing.xs / 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconCheckOut style={rotate ? { transform: [{ rotate: '180deg' }] } : null} color={colors.text} size={iconSize.sm} />
        <TranslationText page="Dashboard" title={labelKey} style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {time ? (
          <>
            <Text style={stylesText({ color: 'title', size: 'lg', weight: 'bold' })}>
              {formatTimeAndPeriod(time).time}
            </Text>
            <Text style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })}>
              {formatTimeAndPeriod(time).period}
            </Text>
          </>
        ) : (
          <>
            <Text style={stylesText({ color: 'title', size: 'lg', weight: 'bold' })}>
              --:--
            </Text>
            <Text style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })}></Text>
          </>
        )}
      </View>
      {showDate && time ? (
        <Text style={stylesText({ color: 'text', size: 'xxs', weight: 'medium' })}>
          {formatDayMonth(time)}
        </Text>
      ) : null}
    </View>
  );
}

export default function AttendanceCard({ row }) {
  const { colors, spacing, radius, globalStyles, stylesText, rowDirection, iconSize, currentLanguage } = useDesignSystem();
  const {
    areaName,
    attendanceDate,
    checkIn,
    checkOut,
    isAcrossDay,
    isLate,
    lateMinutes,
    shiftDuration,
    workingHours,
    isAbcence,
    isHoliday,
    isWeekend,
    isVacation,
    hasPartialDayLeave,
    hasMission,
    hasException,
    shiftCount,
    fingerPrintType,
    forgetCheck,
    sensorId
  } = row;
   const presentStatusType = isHoliday ? 'holiday' : isWeekend ? 'weekend' : isVacation ? 'vacation' : null;
  const presentStatusEntry = presentStatusType
    ? STATUS_COLOR_LIST.find((item) => item.type === presentStatusType)
    : null;
  return (
    <View style={globalStyles.card}>
      {/* Header: date + area + late badge */}
      <View style={{ flexDirection: rowDirection, alignItems: "flex-start", justifyContent: 'space-between' }}>
        <View style={{ flexDirection: "column", }}>
          <Text style={stylesText({ color: 'title', size: 'md', weight: 'bold' })}>
            {formatDateMonthShort(attendanceDate)}
          </Text>
          <Text style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })}>
            {formatWeekday(attendanceDate, currentLanguage)}
          </Text>
        </View>

        {isLate ? (
          <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 4 }}>
            <IconWarning color={colors.warning} size={iconSize.xs} />
            <Text style={stylesText({ color: 'warning', size: 'sm', weight: 'bold' })}>
              +{formatDurationHM(lateMinutes)}
            </Text>
            <TranslationText page="Dashboard" title="late" style={stylesText({ color: 'warning', size: 'sm', weight: 'bold' })} />
          </View>
        ) : (
          <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: isAbcence ? colors.error : presentStatusType ? getStatusColor(presentStatusType) : colors.success }} />
            <TranslationText
              page={isAbcence ? "General" : presentStatusEntry?.page ?? "General"}
              title={isAbcence ? "abcence" : presentStatusEntry?.title ?? "Present"}
              style={[stylesText({ color: isAbcence ? 'error' : presentStatusType ? getStatusColor(presentStatusType) : 'success', size: 'sm', weight: 'bold' }), { textTransform: "capitalize" }]}
            />
          </View>
        )}
      </View>
      {!isWeekend && !isHoliday && !isVacation &&
        < >
          <View style={{
            flexDirection: rowDirection, alignItems: 'center', justifyContent: "space-between", gap: spacing.xl, borderRadius: radius.md,
            padding: spacing.sm, backgroundColor: colors.background
          }}>
            <TimeBlock labelKey="checkIn" rotate time={checkIn} showDate={isAcrossDay} />

            <TimeBlock labelKey="checkOut" time={checkOut} showDate={isAcrossDay} />

            <View style={{ gap: spacing.xs / 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconTimeManagement color={colors.text} size={iconSize.sm} />
                <TranslationText page="Dashboard" title="workedHours" style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })} />
              </View>
              <Text style={stylesText({ color: 'primary', size: 'lg', weight: 'bold' })}>
                {formatDurationHM(workingHours)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
            <StatRow Icon={IconCalendarSmall} labelPage="Shift" subtitle={shiftCount > 0 ? `${shiftCount}` : null} labelKey="title" value={formatDurationHM(shiftDuration)} />

            {FINGERPRINT_TYPE_CONFIG[fingerPrintType] && (
              <StatRow
                {...FINGERPRINT_TYPE_CONFIG[fingerPrintType]}
                value={fingerPrintType == 3 ? areaName : fingerPrintType == 4 ? sensorId : null}
              />
            )}
          </View>

          {(hasException || hasPartialDayLeave || hasMission, forgetCheck) && (
            <View style={{ flexDirection: rowDirection, alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
              {hasException && (
                <StatusNewCell
                  title={'title'}
                  ResourcePage={'AttendanceException'}
                  column={{ color: getStatusColor('exception') }}
                  colors={colors}
                  spacing={spacing}
                  radius={radius}
                  stylesText={stylesText}
                />
              )}
              {forgetCheck && (
                <StatusNewCell
                  title={'forgetCheck'}
                  ResourcePage={'FingerPrint'}
                  column={{ color: colors.warning }}
                  colors={colors}
                  spacing={spacing}
                  radius={radius}
                  stylesText={stylesText}
                />
              )}
              {hasPartialDayLeave && (
                <StatusNewCell
                  title={'title'}
                  ResourcePage={'PartialDayLeave'}
                  column={{ color: getStatusColor('partialLeave') }}
                  colors={colors}
                  spacing={spacing}
                  radius={radius}
                  stylesText={stylesText}
                />
              )}
              {hasMission && (
                <StatusNewCell
                  title={'title'}
                  ResourcePage={'Mission'}
                  column={{ color: getStatusColor('mission') }}
                  colors={colors}
                  spacing={spacing}
                  radius={radius}
                  stylesText={stylesText}
                />
              )}
            </View>
          )}
        </>
      }

    </View>
  );
}
