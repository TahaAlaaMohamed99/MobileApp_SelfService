import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useFormatCell } from '../../utils/useFormatCell';
import ShimmerBone from './ShimmerBone';

/**
 * Skeleton counterpart of MegaGridCard — same JSX structure (outer card, header
 * row, body rows) and the same column-driven shapes (skeletonFieldBlock /
 * formatSkeletonBodyRows from useFormatCell), so the loading card's height and
 * divisions match the real data card for this grid's actual columns exactly,
 * instead of a generic fixed-size placeholder.
 */
export default function MegaGridCardSkeleton({ columnState, hasMenu = false }) {
  const { colors, spacing, globalStyles, rowDirection, iconSize } = useDesignSystem();
  const { skeletonFieldBlock, formatSkeletonBodyRows } = useFormatCell();

  const { avatarCol, titleCol, subtitleCol, badgeCols = [], bodyCols = [] } = columnState || {};

  const headerCols = useMemo(() => {
    const seenKeys = new Set();
    return [avatarCol, titleCol, subtitleCol, ...(badgeCols || [])].filter(
      col => col && !seenKeys.has(col.key) && seenKeys.add(col.key),
    );
  }, [avatarCol, titleCol, subtitleCol, badgeCols]);

  const hasTopRow = headerCols.length > 0;
  const hasBody = bodyCols.length > 0;

  const bodyRowNodes = useMemo(() => formatSkeletonBodyRows(bodyCols), [bodyCols, formatSkeletonBodyRows]);

  const renderHeaderCol = (col) => {
    const widthStyle = col.isCellAvatar
      ? { flex: 1 }
      : col.isFullWidthMobile
        ? { width: '100%' }
        : { maxWidth: '100%' };
    return (
      <View key={col.key} style={widthStyle}>
        {skeletonFieldBlock(col)}
      </View>
    );
  };

  return (
    <View
      style={[
        globalStyles.card,
        {
          flexDirection: rowDirection,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: spacing.sm,
        },
      ]}
    >
      {(hasTopRow || hasBody) && (
        <View style={{ flex: 1, gap: spacing.sm }}>
          {(hasTopRow || hasMenu) && (
            <View
              style={{
                flexDirection: rowDirection,
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.sm,
                paddingBottom: hasBody ? spacing.sm : 0,
              }}
            >
              <View style={{ flex: 1, flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
                {headerCols.map(renderHeaderCol)}
              </View>
              {hasMenu && (
                <ShimmerBone
                  width={iconSize.sm}
                  height={iconSize.sm}
                  borderRadius={iconSize.sm / 2}
                  style={{ backgroundColor: colors.border }}
                />
              )}
            </View>
          )}
          {hasBody && (
            <View style={{ gap: spacing.md }}>
              {bodyRowNodes}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
