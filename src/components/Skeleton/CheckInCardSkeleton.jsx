import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
 import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useShimmer } from '../../hooks/useShimmer';
import ShimmerBone from './ShimmerBone';

 

export default function CheckInCardSkeleton({ theme, style }) {
  const { spacing, radius, rowDirection } = useDesignSystem();
  return (
    <View
      style={[
        {
          borderRadius: 16,
          padding: spacing.base,
          backgroundColor: theme.background,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Decorative circles */}
      <View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -40, width: 150, height: 150, borderRadius: 75, borderColor: theme.circle, borderWidth: 24 }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: -50, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: theme.circle }} />

      {/* Row 1: Status + Location */}
      <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
          <ShimmerBone width={9} height={9} borderRadius={5} />
          <ShimmerBone width={90} height={14} borderRadius={6} />
        </View>
        <ShimmerBone width={70} height={14} borderRadius={6} />
      </View>

      {/* Row 2: Check-In → Check-Out */}
      <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
        <View style={{ width: '40%' }}>
          <ShimmerBone width={60} height={14} borderRadius={6} style={{ marginBottom: 2 }} />
          <View style={{ flexDirection: rowDirection, alignItems: 'flex-end' }}>
            <ShimmerBone width={90} height={32} borderRadius={8} />
            <ShimmerBone width={26} height={14} borderRadius={5} style={{ marginStart: spacing.xs, marginBottom: 4 }} />
          </View>
        </View>

        <ShimmerBone width={20} height={20} borderRadius={10} />

        <View style={{ width: '40%', alignItems: 'flex-end' }}>
          <ShimmerBone width={60} height={14} borderRadius={6} style={{ marginBottom: 2 }} />
          <View style={{ flexDirection: rowDirection, alignItems: 'flex-end' }}>
            <ShimmerBone width={90} height={32} borderRadius={8} />
            <ShimmerBone width={26} height={14} borderRadius={5} style={{ marginStart: spacing.xs, marginBottom: 4 }} />
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: theme.circle, marginVertical: spacing.sm }} />

      {/* Row 3: Shift | Worked Hours | Overtime */}
      <View style={{ flexDirection: rowDirection, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'flex-start' }}>
          <ShimmerBone width={40} height={12} borderRadius={5} style={{ marginBottom: 4 }} />
          <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 2 }}>
            <ShimmerBone width={45} height={14} borderRadius={5} />
            <ShimmerBone width={12} height={12} borderRadius={6} />
            <ShimmerBone width={45} height={14} borderRadius={5} />
          </View>
        </View>

        <View style={{ width: 1, height: 36, backgroundColor: theme.circle, alignSelf: 'center' }} />

        <View style={{ alignItems: 'center' }}>
          <ShimmerBone width={75} height={12} borderRadius={5} style={{ marginBottom: 4 }} />
          <ShimmerBone width={55} height={18} borderRadius={6} />
        </View>

        <View style={{ width: 1, height: 36, backgroundColor: theme.circle, alignSelf: 'center' }} />

        <View style={{ alignItems: 'flex-start' }}>
          <ShimmerBone width={55} height={12} borderRadius={5} style={{ marginBottom: 4 }} />
          <ShimmerBone width={45} height={18} borderRadius={6} />
        </View>
      </View>

      {/* Action button */}
      <ShimmerBone width="100%" height={48} borderRadius={radius.md} style={{ marginTop: spacing.md }} />
    </View>
  );
}