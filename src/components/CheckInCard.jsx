import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { formatTimeAndPeriod, formatDateOnlyForAPI, formatDateMonthShort } from '../hooks/useFormatDate';
import TranslationText from './TranslationText';
import { IconFingerprint, IconLocation, IconTimeManagement, IconMoon, IconArrow, IconWeekend, IconHoliday, IconVacation, IconCalendar } from '../assets/IconsSvg';
import CheckInCardSkeleton from './Skeleton/CheckInCardSkeleton';
import { getStatusColor } from "./Schedule/shiftPalette";

const getTheme = (colors) => ({
  notCheckedIn: {
    background: colors.text,
    circle: 'rgba(255,255,255,0.06)',
    dot: '#9CA3AF',
    statusKey: 'notCheckedIn',
  },
  checkedIn: {
    background: colors.primary,
    circle: 'rgba(255,255,255,0.08)',
    dot: '#22C55E',
    statusKey: 'checkedIn',
  },
  checkedOut: {
    background: colors.primary,
    circle: 'rgba(255,255,255,0.08)',
    dot: '#22C55E',
    statusKey: 'checkedOut',
  },
});

const pad = (n) => String(n).padStart(2, '0');

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

function TimeBlock({
  labelKey,
  time,
  elapsed,
  align = 'flex-start',
  styles,
}) {
  const hasTime = Boolean(elapsed || time);
  const timeData = time ? formatTimeAndPeriod(time) : null;

  return (
    <View style={{ alignItems: align, width: '40%' }}>
      <TranslationText page="Dashboard" title={labelKey} style={styles.timeBlockLabel} />
      {hasTime ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={styles.timeBlockValue}>
            {elapsed ?? timeData?.time}
          </Text>
          {!elapsed && (
            <TranslationText
              page="Dashboard"
              title={timeData?.period}
              style={styles.timeBlockPeriod}
            />
          )}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={styles.timeBlockValue}>{'--:--'}</Text>
          <Text style={styles.timeBlockPeriod}>{'--'}</Text>
        </View>
      )}
    </View>
  );
}

export default function CheckInCard({
  FingPrintData,
  handleCheckFingPrint,
  isLoadingBtn = false,
  isLoading = false,
  style,
}) {
  const router = useRouter();
  const { colors, spacing, rf, radius, stylesText, rowDirection, isDark, iconSize } = useDesignSystem();

  const THEME = useMemo(() => getTheme(colors), [colors]);
  const [now, setNow] = useState(() => new Date());
  const {
    checkIn = null,
    checkOut = null,
    shiftEndDateTime = null,
    shiftStartDateTime = null,
    isAcrossDay = false,
    attendanceDate,
    shiftCount = 1,
    isWeekend = false,
    isHoliday = false,
    isVacation = false
  } = FingPrintData ?? {};

  const { checkInDate, checkOutDate, shiftStartDate, shiftEndDate } = useMemo(
    () => ({
      checkInDate: toDate(checkIn),
      checkOutDate: toDate(checkOut),
      shiftStartDate: toDate(shiftStartDateTime),
      shiftEndDate: toDate(shiftEndDateTime),
    }),
    [checkIn, checkOut, shiftStartDateTime, shiftEndDateTime]
  );

  const isCheckedIn = Boolean(checkInDate);
  const isCheckedOut = Boolean(checkOutDate);
  const status = isCheckedOut ? 'checkedOut' : isCheckedIn ? 'checkedIn' : 'notCheckedIn';
  const theme = THEME[status];

  useEffect(() => {
    if (!isCheckedIn || isCheckedOut) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, isCheckedOut]);

  const { elapsedLabel, overtimeLabel } = useMemo(() => {
    if (!isCheckedIn) return { elapsedLabel: null, overtimeLabel: '00m' };

    const endTime = isCheckedOut ? checkOutDate : now;
    const totalSeconds = Math.max(0, Math.floor((endTime - checkInDate) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const worked = `${pad(hours)}h ${pad(minutes)}m`;

    // Overtime: time beyond shift end
    let overtime = '00m';
    if (shiftEndDate) {
      const overSeconds = Math.max(0, Math.floor((endTime - shiftEndDate) / 1000));
      if (overSeconds > 0) {
        const overMins = Math.floor(overSeconds / 60);
        const overHours = Math.floor(overMins / 60);
        overtime = overHours > 0
          ? `${pad(overHours)}h ${pad(overMins % 60)}m`
          : `${pad(overMins)}m`;
      }
    }

    return { elapsedLabel: worked, overtimeLabel: overtime };
  }, [isCheckedIn, isCheckedOut, checkInDate, checkOutDate, shiftEndDate, now]);

  const styles = useMemo(
    () => createStyles({ colors, spacing, stylesText, isDark, rowDirection, radius }),
    [colors, spacing, stylesText, isDark, rowDirection, radius]
  );

  const { leftBlockProps, rightBlockProps } = useMemo(() => ({
    leftBlockProps: { time: checkIn },
    rightBlockProps: { time: checkOut },
  }), [isCheckedIn, checkIn, checkOut, shiftStartDateTime]);

  if (isLoading) {
    return <CheckInCardSkeleton theme={theme} style={style} />;
  }

  const isSpecialDay = isWeekend || isHoliday || isVacation;

  if (isSpecialDay) {
    const specialTheme = {
      isWeekend: {
        color: getStatusColor('weekend'),
        statusKey: 'weekend',
        messageKey: 'enjoyYourWeekend',
        page: "General",
        icon: 'weekend',
      },
      isHoliday: {
        color: getStatusColor('holiday'),
        statusKey: 'holiday',
        messageKey: 'enjoyYourHoliday',
        page: "General",
        icon: 'holiday',
        
      },
      isVacation: {
        color: getStatusColor('vacation'),
        statusKey: 'Vacation',
        messageKey: 'enjoyYourVacation',
        page: "General",
        icon: 'vacation',
        route: '/VacationTransaction',
      },
    };

    const activeSpecial = isVacation ? specialTheme.isVacation : isHoliday ? specialTheme.isHoliday : specialTheme.isWeekend;

    return (
      <View style={[styles.card, { backgroundColor: activeSpecial.color, justifyContent: "space-between" }, style]}>
        {/* Soft decorative circles */}
        <View pointerEvents="none" style={[styles.specialDecoCircle, { top: -40, right: -60 }]} />
        <View pointerEvents="none" style={[styles.specialDecoCircle, { bottom: -80, left: -40, width: 200, height: 200 }]} />

        {/* Top Section: Status */}

        <View style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          minHeight: rf(120),
          justifyContent: 'space-between',
        }}>
          <View style={styles.specialContentSection}>
            <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
              <View style={styles.statusGroup}>
                <View style={[styles.statusDot, { backgroundColor: 'rgba(240,244,255,1)' }]} />
                <TranslationText
                  page={activeSpecial.page}
                  title={activeSpecial.statusKey}
                  style={styles.statusLabel}
                />
              </View>
            </View>

            {/* Headline + Description */}
            <View style={styles.specialTextSection}>
              <TranslationText
                page="Dashboard"
                title={activeSpecial.messageKey}
                style={styles.specialHeadline}
              />
              <TranslationText
                page="Dashboard"
                title="noAttendanceRequired"
                style={styles.specialDescription}
              />
            </View>
          </View>
          <View style={styles.specialIconSection}>
            {activeSpecial.icon === 'vacation' ? (
              <IconVacation color="rgba(255,255,255,0.5)" size={rf(80)} />
            ) : activeSpecial.icon === 'holiday' ? (
              <IconHoliday color="rgba(255,255,255,0.5)" size={rf(120)} />
            ) : (
              <IconWeekend color="rgba(240,244,255,0.5)" size={rf(120)} />
            )}
          </View>
        </View>




        {/* Bottom Section: Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/Schedule')}
          disabled={isLoadingBtn}
          style={[styles.actionButton, { flexDirection: rowDirection }]}
        >
          <IconCalendar color="rgba(255,255,255,0.9)" size={18} />
          <TranslationText
            page="Dashboard"
            title="viewSchedule"
            style={styles.actionLabel}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.background }, style]}>
      {/* Decorative circles */}
      <View pointerEvents="none" style={[styles.decoCircleTopRight, { borderColor: theme.circle }]} />
      <View pointerEvents="none" style={[styles.decoCircleBottomLeft, { backgroundColor: theme.circle }]} />

      {/* ── Row 1: Status + Location/Shift-Type ── */}
      <View style={styles.headerRow}>
        <View style={styles.statusGroup}>
          <View style={[styles.statusDot, { backgroundColor: theme.dot }]} />
          <TranslationText page="Dashboard" title={theme.statusKey} style={styles.statusLabel} />
        </View>

        <View style={styles.headerRight}>
          {FingPrintData?.areaName ? (
            <View style={styles.locationPill}>
              <IconLocation color="rgba(255,255,255,0.9)" size={iconSize.xs} />
              <Text style={styles.locationText}>{FingPrintData.areaName}</Text>
            </View>
          ) : null}


        </View>
      </View>

      {/* ── Row 2: Check-In → Check-Out times ── */}
      <View style={styles.timesRow}>
        <TimeBlock
          {...leftBlockProps}
          labelKey="checkIn"
          align="flex-start"
          styles={styles}
        />

        <View style={[styles.arrowWrap, { transform: [{ rotate: '180deg' }] }]}>
          <IconArrow color="rgba(255,255,255,0.7)" size={iconSize.md} />
        </View>

        <TimeBlock
          {...rightBlockProps}
          labelKey="checkOut"
          align="flex-end"
          styles={styles}
        />
      </View>

      {/* ── Divider ── */}
      <View style={styles.sectionDivider} />

      {/* ── Row 3: Shift | Worked Hours | Overtime ── */}
      <View style={styles.statsRow}>
        {/* Shift */}
        <View style={[styles.statSegment]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: isAcrossDay ? "flex-start" : "space-between", alignSelf: 'stretch' }}>
            <View style={{ flexDirection: "row" }}>
              <TranslationText page="Shift" title="title" style={styles.statLabel} />
              {shiftCount &&
                <Text style={styles.statLabel}>
                  ({shiftCount})
                </Text>
              }

            </View>
            {!isAcrossDay && (
              <Text style={styles.day}>
                {formatDateMonthShort(attendanceDate)}
              </Text>
            )}
          </View>
          <View style={styles.shiftTimeRow}>
            <View flexDirection={{ flexDirection: "column" }}>
              <Text style={styles.statValue}>
                {formatTimeAndPeriod(shiftStartDateTime)?.time}
                <Text style={styles.statPeriod}> {formatTimeAndPeriod(shiftStartDateTime)?.period}</Text>
              </Text>
              {isAcrossDay &&
                <Text style={styles.statPeriod}>
                  {formatDateMonthShort(shiftStartDateTime)}
                </Text>
              }

            </View>

            <View style={[styles.shiftArrow, { transform: [{ rotate: '180deg' }] }]}>
              <IconArrow size={iconSize.xs} color="rgba(255,255,255,0.6)" />
            </View>
            <View flexDirection={{ flexDirection: "column" }}>
              <Text style={styles.statValue}>
                {formatTimeAndPeriod(shiftEndDateTime)?.time}
                <Text style={styles.statPeriod}> {formatTimeAndPeriod(shiftEndDateTime)?.period}</Text>
              </Text>
              {isAcrossDay &&
                <Text style={styles.statPeriod}>
                  {formatDateMonthShort(shiftEndDateTime)}
                </Text>
              }
            </View>
          </View>
        </View>

        <View style={styles.statDivider} />

        {/* Worked Hours */}
        <View style={[styles.statSegment, { alignItems: 'center' }]}>
          <TranslationText page="Dashboard" title="workedHours" style={styles.statLabel} />
          <Text style={styles.statValueLarge}>{elapsedLabel ?? '--h --m'}</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Overtime */}
        <View style={styles.statSegment}>
          <TranslationText page="Dashboard" title="extraTime" style={styles.statLabel} />
          <Text style={styles.statValueLarge}>{overtimeLabel}</Text>
        </View>
      </View>

      {/* ── Action Button ── */}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isLoadingBtn}
        onPress={handleCheckFingPrint}
        style={[styles.actionButton, { flexDirection: rowDirection }]}
      >
        {isLoadingBtn ? (
          <ActivityIndicator size="small" color="rgba(240,244,255,1)" />
        ) : (
          <IconFingerprint color="rgba(240,244,255,1)" size={iconSize.md} />
        )}
        <TranslationText
          page="Dashboard"
          title={`${isCheckedIn ? 'checkOut' : 'checkIn'}`}
          style={styles.actionLabel}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = ({ colors, spacing, stylesText, isDark, rowDirection, radius }) => {
  // ── Palette ────────────────────────────────────────────────
  const white = (opacity) => `rgba(255,255,255,${opacity})`;
  const snow = 'rgba(240,244,255,1)';

  const palette = {
    // text on coloured card
    statusLabel: snow,
    locationText: white(0.9),
    nightShiftText: white(0.9),

    // time block
    timeBlockLabel: isDark ? white(0.7) : white(0.9),
    timeBlockValue: snow,
    timeBlockPeriod: snow,

    // stats row
    statLabel: isDark ? white(0.65) : white(0.80),
    statValue: snow,
    statDivider: isDark ? white(0.2) : white(0.3),

    // section divider
    sectionDivider: isDark ? white(0.2) : white(0.3),

    // action button
    actionBg: isDark ? white(0.12) : white(0.18),
    actionBorder: isDark ? white(0.25) : white(0.35),
    actionLabel: snow,
  };

  return StyleSheet.create({
    // ── Card shell ──────────────────────────────────────────
    card: {
      borderRadius: 16,
      padding: spacing.base,
      overflow: 'hidden',
    },

    // ── Decorative background circles ───────────────────────
    decoCircleTopRight: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 24,
    },
    decoCircleBottomLeft: {
      position: 'absolute',
      bottom: -50,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
    },

    // ── Row 1: header ───────────────────────────────────────
    headerRow: {
      flexDirection: rowDirection,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusGroup: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 10,
    },
    statusLabel: {
      ...stylesText({ color: palette.statusLabel, size: 'sm', weight: 'bold' }),
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    headerRight: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: spacing.xs,
    },
    locationPill: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      ...stylesText({ color: palette.locationText, size: 'sm', weight: 'semiBold' }),
    },
    nightShiftPill: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 4,
      backgroundColor: white(0.15),
      borderRadius: 20,
      paddingVertical: 3,
      paddingHorizontal: spacing.sm,
    },
    nightShiftText: {
      ...stylesText({ color: palette.nightShiftText, size: 'xs', weight: 'semiBold' }),
    },

    // ── Row 2: Check-In / Check-Out ─────────────────────────
    timesRow: {
      flexDirection: rowDirection,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    arrowWrap: {
      opacity: 0.7,
    },

    // TimeBlock internal styles
    timeBlockLabel: {
      ...stylesText({ color: palette.timeBlockLabel, size: 'sm', weight: 'semiBold' }),
      letterSpacing: 0.3,
      marginBottom: 2,
    },
    timeBlockValue: {
      ...stylesText({ color: palette.timeBlockValue, size: 'xxxl', weight: 'bold' }),
    },
    timeBlockPeriod: {
      ...stylesText({ color: palette.timeBlockPeriod, size: 'base', weight: 'bold' }),
      marginBottom: 4,
      marginLeft: spacing.xs,
      opacity: 0.85,
    },

    // ── Section divider ─────────────────────────────────────
    sectionDivider: {
      height: 1,
      backgroundColor: palette.sectionDivider,
      marginVertical: spacing.sm,
    },

    // ── Row 3: Stats (Shift | Worked | Overtime) ────────────
    statsRow: {
      flexDirection: rowDirection,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    statSegment: {
      alignItems: 'flex-start',
    },
    statLabel: {
      ...stylesText({ color: palette.statLabel, size: 'xs', weight: 'semiBold' }),
      marginBottom: 4,
    },
    day: {
      ...stylesText({ color: palette.statValue, size: 'xs', weight: 'semiBold' }),
      marginBottom: 4,
    },
    statValue: {
      ...stylesText({ color: palette.statValue, size: 'sm', weight: 'bold' }),
    },
    statValueLarge: {
      ...stylesText({ color: palette.statValue, size: 'base', weight: 'bold' }),
    },
    statPeriod: {
      ...stylesText({ color: palette.statValue, size: 'xs', weight: 'semiBold' }),
      opacity: 0.8,
    },
    statDivider: {
      width: 1,
      height: 36,
      backgroundColor: palette.statDivider,
      marginHorizontal: spacing.xs,
      alignSelf: 'center',
    },
    shiftTimeRow: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 2,
      alignSelf: 'stretch',
    },
    shiftArrow: {
      marginHorizontal: 2,
      opacity: 0.7,
    },

    actionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      marginTop: spacing.base,
      borderRadius: radius.md,
      backgroundColor: palette.actionBg,
      borderWidth: 1,
      borderColor: palette.actionBorder,
    },
    actionLabel: {
      ...stylesText({ color: palette.actionLabel, size: 'base', weight: 'bold' }),
    },

    specialDecoCircle: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.08)',
      width: 160,
      height: 160,
    },
    specialIconSection: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '35%',
      paddingRight: spacing.base,
    },
    specialContentSection: {
      flex: 1,
      justifyContent: 'space-between',
    },
    specialTextSection: {
      flex: 1,
      justifyContent: 'center',
    },
    specialHeadline: {
      ...stylesText({ color: white(0.98), size: 'lg', weight: 'bold' }),
      marginBottom: spacing.xs,
    },
    specialDescription: {
      ...stylesText({ color: white(0.8), size: 'sm', weight: 'medium' }),
    },

  });
};