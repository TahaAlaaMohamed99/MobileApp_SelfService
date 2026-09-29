import React, { useContext, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MegaGridContext } from './MegaGridContext';
import DropdownActions from '../DropdownActions';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { IconDotsVertical } from '../../assets/IconsSvg';
import { useFormatCell } from '../../utils/useFormatCell';

function MegaGridCard({ row }) {
  const {
    columnState,
    ResourcePage,
    onClickRow,
    rowActionList,
    renderCell,      // optional custom formatter from parent
  } = useContext(MegaGridContext);

  const {
    colors, spacing, globalStyles,
    rowDirection, iconSize,
  } = useDesignSystem();

  const { formatCell: defaultFormatCell, formatBodyRows } = useFormatCell();
  const formatCell = renderCell ?? defaultFormatCell;

  const { bodyCols, titleCol, subtitleCol, avatarCol, badgeCols, footerCols } = columnState;
  const hasBody = bodyCols.some(c => row[c.key] != null && row[c.key] !== '');

  const headerCols = useMemo(() => {
    const seenKeys = new Set();
    return [avatarCol, titleCol, subtitleCol, ...(badgeCols || [])].filter(
      col => col && !seenKeys.has(col.key) && seenKeys.add(col.key),
    );
  }, [avatarCol, titleCol, subtitleCol, badgeCols]);

  const menuItems = useMemo(
    () => rowActionList?.filter(action => {
      if (!action.checkedShow) return true;
      return action.checkedShow.some(check =>
        Object.entries(check).every(([key, value]) => {
          const rowValue = row[key];
          if (Array.isArray(value)) {
            return value.includes(rowValue);
          }
          return rowValue === value;
        })
      );
    }).map(action => ({
      ...action,
      onClick: () => action.onClick?.(row),
    })) ?? [],
    [rowActionList, row],
  );

  const hasTopRow = headerCols.length > 0;

  const bodyRowNodes = useMemo(
    () => formatBodyRows(bodyCols, row, ResourcePage),
    [bodyCols, row, ResourcePage, formatBodyRows],
  );

  const renderCol = (col) => {
    const cell = formatCell(col, row, ResourcePage);
    if (!cell) return null;
    const widthStyle = col.isCellAvatar
      ? { flex: 1 }
      : col.isFullWidthMobile
        ? { width: '100%' }
        : { maxWidth: '100%' };
    return (
      <View key={col.key} style={widthStyle}>
        {cell}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        globalStyles.card,
        {
          flexDirection: rowDirection,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: spacing.sm,
        },
      ]}
      onPress={() => onClickRow && onClickRow?.(row)}
    >
      {/* Header row + body row — each column rendered as its own label + value block */}
      {(hasTopRow || hasBody) && (
        <View style={{ flex: 1, gap: spacing.sm }}>
          {(hasTopRow || menuItems.length > 0) && (
            <View
              style={{
                flexDirection: rowDirection,
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.sm,
               }}
            >
              <View style={{ flex: 1, flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', justifyContent: "space-between", gap: spacing.sm }}>
                {headerCols.map(col => renderCol(col))}
              </View>
              {menuItems.length > 0 && (
                <View onStartShouldSetResponder={() => true}>
                  <DropdownActions
                    menuItems={menuItems}
                    ResourcePage={ResourcePage || 'General'}
                    btn={
                      <View
                         style={{ paddingStart: spacing.sm, }}
                      >
                        <IconDotsVertical color={colors.text} size={iconSize.sm} />
                      </View>
                    }
                  />
                </View>
              )}
            </View>
          )}
          {hasBody && (
            <View style={{ gap: spacing.md }}>
              {bodyRowNodes}
            </View>
          )}
          {footerCols.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
                paddingTop: spacing.sm,
                alignItems: 'center',
              }}
            >
              {footerCols.map(col => {
                const cell = formatCell(col, row, ResourcePage);
                return cell ? (
                  <View key={col.key}>
                    {cell}
                  </View>
                ) : null;
              })}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// FlashList can call renderItem again for a recycled cell holding the same
// logical row (e.g. during scroll); memo skips re-work in that case. Real
// data/column changes still go through — those come via MegaGridContext,
// which triggers this component's own useContext subscription regardless
// of memo.
export default React.memo(MegaGridCard);
