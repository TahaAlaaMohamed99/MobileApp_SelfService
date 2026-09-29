import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Linking } from 'react-native';
import dayjs from 'dayjs';
import { formatDateMonthShort, formatWeekday, useFormatDate, useFormatDateDaly, formatDayMonth, formatTimeWithPeriod, formatTimeAndPeriod } from '../hooks/useFormatDate';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { getStatusColor } from './statusColor';
import TranslationText from '../components/TranslationText';
import AutoFontText from '../components/AutoFontText';
import ShimmerBone from '../components/Skeleton/ShimmerBone';
import { StatusNewCell } from '../components/StatusNewCell';
import formatMoney from './formatMoney';
import { formatHours } from './timeFormatters';

// Columns sharing the same `rowGroup` render together in one row-group; a
// `rowGroup` used by only one column renders it alone in that same box.
// Columns with no `rowGroup` pair up automatically, two at a time, plain.
// `fullWidth` columns always get their own row. Pure function of `columns`
// (no row data), so both the real rows and the skeleton rows can share it —
// the skeleton ends up with the exact same groups/widths as the real card.
const DEFAULT_CELL_WIDTH = '47%';

function groupColumns(columns) {
  const groups = [];
  const groupsByKey = new Map();
  let autoPairGroup = null;
  columns.forEach(col => {
    if (col.fullWidth) {
      groups.push([col]);
      autoPairGroup = null;
      return;
    }
    if (col.rowGroup) {
      let group = groupsByKey.get(col.rowGroup);
      if (!group) {
        group = [];
        group.isRowGroup = true;
        groupsByKey.set(col.rowGroup, group);
        groups.push(group);
      }
      group.push(col);
      autoPairGroup = null;
      return;
    }
    if (autoPairGroup && autoPairGroup.length < 2) {
      autoPairGroup.push(col);
      autoPairGroup = null;
    } else {
      autoPairGroup = [col];
      groups.push(autoPairGroup);
    }
  });
  return groups;
}



function getInitials(name) {
  if (!name) return '?';
  return String(name)
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getIcon(icon) {
  return icon || null;
}

/** Circular avatar bubble alone (image, or initials fallback) — reused by CellAvatar and MegaGridCard's header. */
export function AvatarBubble({ value, imageKey, size = 32, colors, fonts, rf }) {
  const initials = getInitials(value);
  const dimension = rf(size);

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageKey ? (
        <Image source={{ uri: imageKey }} style={{ width: dimension, height: dimension }} />
      ) : (
        <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: rf(size * 0.375) }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

function CellAvatar({
  value,
  imageKey,
  secondKeyText,
  isShowInModalContent = true,
  showAvatarBubble = true,
  colors,
  spacing,
  fonts,
  stylesText,
  rf,
}) {
  // Compact mode (isShowInModalContent = false): no fallback initials bubble when
  // there's no image, content centered side-by-side, subtitle shown as plain "#value".
  return (
    <View
      style={
        isShowInModalContent
          ? { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }
          : { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: spacing.base }
      }
    >
      {showAvatarBubble && (imageKey || isShowInModalContent) && (
        <AvatarBubble value={value} imageKey={imageKey} size={32} colors={colors} fonts={fonts} rf={rf} />
      )}
      <View style={isShowInModalContent ? { flex: 1 } : { flexDirection: 'row', alignItems: 'flex-start' }}>
        <AutoFontText
          value={value}
          color="primary"
          size="sm"
          weight="bold"
          numberOfLines={1}
        />
        {secondKeyText != null && secondKeyText !== '' && (
          isShowInModalContent ? (
            <AutoFontText value={secondKeyText} color="text" size="xs" numberOfLines={1} />
          ) : (
            <AutoFontText value={secondKeyText} color="text" size="sm" numberOfLines={1}>
              {`#${secondKeyText}`}
            </AutoFontText>
          )
        )}
      </View>
    </View>
  );
}

function StatusCell({ value, column, row, colors, spacing, stylesText }) {
  const statusColor = column.statusColor ? colors[column.statusColor] : getStatusColor(column, row, colors);
  const overRideTitle = column?.overRideTitleList?.[row[column.secondKey]] || null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 7,
          backgroundColor: statusColor,
        }}
      />
      {overRideTitle ?
        <TranslationText
          page={overRideTitle?.ResourcePage || 'GeneralField'}
          title={overRideTitle?.title}
          style={stylesText({ color: statusColor, size: 'xs', weight: 'medium' })}
        />
        :
        <AutoFontText
          value={value}
          weight="bold"
          style={[
            stylesText({ color: statusColor, size: 'sm', weight: 'bold' }),
            { textTransform: 'capitalize' },
          ]}
          numberOfLines={1}
        />
      }

    </View>
  );
}


/**
 * Hook that returns a formatCell(column, row, ResourcePage) → ReactNode function.
 * Replaces the web useformatDataGrid utility. Renders the value AND, unless
 * column.isHideTitleCard, the field's title label above it.
 * Can be overridden per-grid via the renderCell prop.
 */
export function useFormatCell() {
  const ds = useDesignSystem();
  const { colors, spacing, radius, fonts, stylesText, rf, currentLanguage, iconSize } = ds;

  // Memoized (not recomputed each render) so the useCallback chain below —
  // and MegaGridCard's useMemo keyed on formatBodyRows — can actually keep a
  // stable identity across re-renders instead of recomputing on every one.
  const textStyle = useMemo(
    () => stylesText({ color: 'title', size: 'md', weight: 'medium' }),
    [stylesText],
  );
  const linkStyle = useMemo(
    () => ({ ...stylesText({ color: 'primary', size: 'sm', weight: 'medium' }), textDecorationLine: 'underline' }),
    [stylesText],
  );
  const boneStyle = useMemo(() => ({ backgroundColor: colors.border }), [colors]);

  const formatValue = useCallback((column, row, value) => {
    switch (column.type) {
      case 'date':
        return <Text style={textStyle}>{useFormatDate(value)}</Text>;
      case 'dateAndDay':
        return <View>
          <View style={{ flexDirection: "column", }}>
            <Text style={stylesText({ color: 'title', size: 'md', weight: 'bold' })}>
              {formatDateMonthShort(value, currentLanguage)}
            </Text>
            <Text style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })}>
              {formatWeekday(value, currentLanguage)}
            </Text>
          </View>
        </View>
      case 'switchStatus': {
        if (column.switch && Array.isArray(column.switch)) {
          const matchedStatus = column.switch.find(item => row[item.key] === item.chackedKey);
          if (matchedStatus) {
            return (
              <StatusNewCell
                title={matchedStatus.title}
                column={{ ...column, color: matchedStatus.color }}
                colors={colors}
                ResourcePage={matchedStatus?.ResourcePage || "General"}
                spacing={spacing}
                radius={radius}
                stylesText={stylesText}
              />
            );
          }
        }
        return null;
      };


      case 'dateTime':
        return <Text numberOfLines={1} style={textStyle}>{useFormatDate(value, currentLanguage, true)}</Text>;

      case 'time': {
        if (!value) return '';
        if (column?.format === 'onlyHours') {
          if (typeof value === 'string' && value.includes(':')) {
            return <Text style={textStyle}>{value.substring(0, 5)}</Text>;
          }
          return <Text style={textStyle}>{dayjs(value).format('HH:mm')}</Text>;
        }
        if (typeof value === 'string' && value.includes(':')) {
          const [h, m] = value.split(':');
          const d = dayjs().hour(parseInt(h, 10) || 0).minute(parseInt(m, 10) || 0);
          return <Text style={textStyle}>{d.format('hh:mm A')}</Text>;
        }
        return <Text style={textStyle}>{dayjs(value).format('hh:mm A')}</Text>;
      }
      case 'hours':
        return <Text style={textStyle}>{formatHours(value)}</Text>;

      case 'timeWithIcon': {
        const Icon = getIcon(column.icon);
        const formattedTime = column?.format == "hours" ? formatHours(value) : column?.format == "onlyHours" ? formatTimeWithPeriod(value) : column?.format == "time" ? formatTimeAndPeriod(value) : value;
        return (
          <View style={{ gap: spacing.xs / 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {Icon && <Icon color={colors.text} size={iconSize.sm} style={column.iconRotate ? { transform: [{ rotate: '180deg' }] } : null} />}
              <TranslationText
                page={column.ResourcePage || 'Dashboard'}
                title={column.title}
                style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
              <Text style={stylesText({ color: column.color || 'title', size: 'lg', weight: 'bold' })}>
                {formattedTime?.time || formattedTime}
              </Text>
              {formattedTime?.period &&
                <Text style={stylesText({ color: 'text', size: 'xs', weight: 'medium' })}>
                  {formattedTime?.period}
                </Text>
              }

            </View>
            {column.showDate && value && (
              <Text style={stylesText({ color: 'text', size: 'xxs', weight: 'medium' })}>
                {formatDayMonth(value)}
              </Text>
            )}
          </View>
        );
      }



      case 'iconLabel': {
        const Icon = getIcon(column.icon);
        const iconColor = column.iconColor ? colors[column.iconColor] : colors.text;
        const textColor = column.textColor || column.iconColor || 'text';
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs / 2 }}>
            {Icon && <Icon color={iconColor} size={column.iconSize || 12} />}
            <TranslationText
              page={column.ResourcePage || 'GeneralField'}
              title={column.title}
              style={stylesText({ color: textColor, size: 'xs', weight: 'medium' })}
            />
          </View>
        );
      }

      case 'salary':
        const currency = row[column?.currencyKey || ""];
        const formattedValue = formatMoney(value);
        const isArabicCurrency = /[\u0600-\u06FF]/.test(currency);
        const valueStyle = stylesText({ color: column.color ?? 'title', size: 'md', weight: 'bold' });
        const currencyStyle = stylesText({ color: column.color ?? 'title', size: 'xs', weight: 'bold' });

        return (
          <Text numberOfLines={2} style={{ flexDirection: isArabicCurrency ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            <Text numberOfLines={1} style={valueStyle}>{formattedValue}</Text>
            {currency && <Text style={currencyStyle}>{` ${currency} `}</Text>}
          </Text>
        );

      case 'email':
        return (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${value}`)}>
            <Text style={linkStyle}>{value}</Text>
          </TouchableOpacity>
        );

      case 'tel':
        return (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${value}`)}>
            <Text style={linkStyle}>{value}</Text>
          </TouchableOpacity>
        );

      case 'status':
        return (
          <StatusCell
            value={value}
            column={column}
            row={row}
            colors={colors}
            spacing={spacing}
            radius={radius}
            stylesText={stylesText}
          />
        );

      case 'statusChecked':
        const CheckedValue = value == column?.CheckedValue
        return (CheckedValue &&
          <StatusNewCell
            title={column?.title}
            ResourcePage={column?.ResourcePage}
            column={column}
            colors={colors}
            spacing={spacing}
            radius={radius}
            stylesText={stylesText}
          />
        );

      case 'color':
        return (
          <View
            style={{
              width: rf(20),
              height: rf(20),
              borderRadius: radius.sm,
              backgroundColor: value,
            }}
          />
        );

      case 'Merge': {
        const mergedText = `${value} ${row[column.secondKey] ?? ''}`;
        return <AutoFontText value={mergedText} weight="medium" style={textStyle} />;
      }

      default: {
        const displayValue = value;

        if (column?.secondKeyText && column?.isCellAvatar) {
          return (
            <CellAvatar
              value={value}
              imageKey={row[column?.imageKey]}
              secondKeyText={row[column?.secondKeyText]}
              isShowInModalContent={column?.isShowInModalContent ?? true}
              showAvatarBubble={column?.isCellAvatarText !== false}
              colors={colors}
              spacing={spacing}
              radius={radius}
              fonts={fonts}
              stylesText={stylesText}
              rf={rf}
            />
          );
        }

        if (column?.isMergedDesign) {
          const keyIdValue = column?.keyId ? row[column.keyId] : undefined;
          const secondKeyValue = row[column?.secondKey];
          const secondKeyDisplay = column?.secondKeyForamt === 'dateMonthTime'
            ? (keyIdValue > 0 && secondKeyValue ? useFormatDateDaly(secondKeyValue) : null)
            : secondKeyValue;

          return (
            <View style={{ gap: spacing.xs / 2, width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <AutoFontText
                  value={value}
                  color="title"
                  size="sm"
                  weight="medium"
                  style={{ flexShrink: 1 }}
                  numberOfLines={1}
                >
                  {value}
                  {row[column?.mergKey] && ` (${row[column.mergKey]})`}
                </AutoFontText>

              </View>
              {secondKeyDisplay && (
                <AutoFontText value={secondKeyDisplay} color="text" size="xs" numberOfLines={1} />
              )}
            </View>
          );
        }

        return (
          <AutoFontText value={displayValue} weight="medium" style={textStyle} numberOfLines={1}>
            {displayValue == null ? '' : String(displayValue)}
          </AutoFontText>
        );
      }
    }
  }, [colors, spacing, radius, fonts, stylesText, rf, textStyle, linkStyle]);

  const withLabel = useCallback((column, row, ResourcePage, valueNode) => {
    if (column.isHideTitleCard || column.type == "timeWithIcon" || column.type == "statusChecked" || column.type == "switchStatus") return valueNode;
    return (
      <View style={{ gap: spacing.xs / 2 }}>
        <TranslationText
          title={column.title}
          page={column.generallist || column.ResourcePage || ResourcePage}
          titleGenerallist={!!column.generallist}
          style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })}
          numberOfLines={1}
        />
        {valueNode}
      </View>
    );
  }, [spacing, stylesText]);

  const fieldBlock = useCallback((column, row, ResourcePage) => {
    const checkedView = column.checkedViwe || column.checkedView;
    if (checkedView) {
      const sourceValue = row[checkedView.key];
      const allowedValues = Array.isArray(checkedView.value) ? checkedView.value : [checkedView.value];
      if (!allowedValues.includes(sourceValue)) {
        return null;
      }
    }

    if (column.hideWhen) {
      const conditions = Array.isArray(column.hideWhen) ? column.hideWhen : [column.hideWhen];
      const shouldHide = conditions.some(condition => {
        const sourceValue = row[condition.columnKey];
        return condition.values?.includes(sourceValue);
      });
      if (shouldHide) {
        return null;
      }
    }
    const value = row[column.key];
    return withLabel(column, row, ResourcePage, formatValue(column, row, value));
  }, [withLabel, formatValue]);

  const formatCell = useCallback(
    (column, row, ResourcePage) => fieldBlock(column, row, ResourcePage),
    [fieldBlock],
  );

  // Takes the full list of body columns and returns the finished array of row
  // nodes, ready to render. Each column declares its own width via `cellWidth`
  // (default '47%'); the container wraps (flexWrap), so a group of e.g. 4
  // naturally lays out as two rows of two instead of squeezing everything onto
  // one line. Grouping itself lives in groupColumns() above so the skeleton
  // (formatSkeletonBodyRows) can reuse the exact same layout.
  const wrapGroup = useCallback((group, i, blocks) => {
    if (blocks.length === 0) return null;

    if (!group.isRowGroup) {
      return blocks.length === 1
        ? <View key={i} style={{ width: '100%' }}>{blocks[0].node}</View>
        : (
          <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {blocks.map(b => <View key={b.key} style={{ width: b.cellWidth }}>{b.node}</View>)}
          </View>
        );
    }

    const backgroundRowGroup = group.find(c => c.backgroundRowGroup)?.backgroundRowGroup;
    const boxStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      backgroundColor: backgroundRowGroup ? colors[backgroundRowGroup] : colors.background,
      borderRadius: radius.md,
      padding: spacing.sm,
    };
    return (
      <View key={i} style={boxStyle}>
        {blocks.map(b => <View key={b.key} style={{ width: b.cellWidth }}>{b.node}</View>)}
      </View>
    );
  }, [spacing, colors, radius]);

  const formatBodyRows = useCallback((columns, row, ResourcePage, isFooter = false) => {
    const groups = groupColumns(columns);

    return groups
      .map((group, i) => {
        const blocks = group
          .map(col => ({
            key: col.key,
            cellWidth: isFooter ? col.cellWidth : (col.cellWidth || DEFAULT_CELL_WIDTH),
            node: fieldBlock(col, row, ResourcePage)
          }))
          .filter(b => b.node);
        return wrapGroup(group, i, blocks);
      })
      .filter(Boolean);
  }, [fieldBlock, wrapGroup]);

  // Skeleton counterpart of a single field's label + value (fieldBlock), built
  // from the column's `type` alone so its shape matches what formatValue would
  // render for that type, without needing a row to read a value from.
  const skeletonFieldBlock = useCallback((column) => {
    let valueNode;
    switch (column.type) {
      case 'status':
      case 'switchStatus':
      case 'statusChecked':
        valueNode = (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <ShimmerBone width={8} height={8} borderRadius={4} style={boneStyle} />
            <ShimmerBone width="50%" height={12} borderRadius={5} style={boneStyle} />
          </View>
        );
        break;

      case 'color':
        valueNode = <ShimmerBone width={rf(20)} height={rf(20)} borderRadius={radius.sm} style={boneStyle} />;
        break;

      default:
        if (column.isCellAvatar) {
          valueNode = (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <ShimmerBone width={rf(32)} height={rf(32)} borderRadius={rf(16)} style={boneStyle} />
              <View style={{ flex: 1, gap: spacing.xs / 2 }}>
                <ShimmerBone width="60%" height={14} borderRadius={6} style={boneStyle} />
                {column.secondKeyText && <ShimmerBone width="40%" height={11} borderRadius={5} style={boneStyle} />}
              </View>
            </View>
          );
        } else if (column.isMergedDesign) {
          valueNode = (
            <View style={{ gap: spacing.xs / 2, width: '100%' }}>
              <ShimmerBone width="70%" height={14} borderRadius={6} style={boneStyle} />
              <ShimmerBone width="45%" height={11} borderRadius={5} style={boneStyle} />
            </View>
          );
        } else {
          valueNode = <ShimmerBone width="75%" height={14} borderRadius={6} style={boneStyle} />;
        }
    }

    if (column.isHideTitleCard) return valueNode;

    return (
      <View style={{ gap: spacing.xs / 2 }}>
        <ShimmerBone width="40%" height={11} borderRadius={5} style={boneStyle} />
        {valueNode}
      </View>
    );
  }, [spacing, radius, rf, boneStyle]);

  // Skeleton counterpart of formatBodyRows — same groupColumns() grouping, same
  // cellWidths, same rowGroup backgrounds, so the loading card's divisions and
  // height match the real data card exactly, field-shimmer instead of values.
  const formatSkeletonBodyRows = useCallback((columns) => {
    const groups = groupColumns(columns);

    return groups.map((group, i) => {
      const blocks = group.map(col => ({
        key: col.key,
        cellWidth: col.cellWidth || DEFAULT_CELL_WIDTH,
        node: skeletonFieldBlock(col),
      }));
      return wrapGroup(group, i, blocks);
    });
  }, [skeletonFieldBlock, wrapGroup]);

  return { formatCell, formatBodyRows, formatSkeletonBodyRows, skeletonFieldBlock };
}
