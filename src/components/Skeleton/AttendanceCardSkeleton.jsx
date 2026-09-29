import { View } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import ShimmerBone from './ShimmerBone';

function TimeBlockSkeleton({ align }) {
  const { spacing } = useDesignSystem();
  return (
    <View style={{ gap: spacing.xs / 2, alignItems: align }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <ShimmerBone width={14} height={14} borderRadius={7} />
        <ShimmerBone width={45} height={11} borderRadius={5} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <ShimmerBone width={50} height={20} borderRadius={6} />
        <ShimmerBone width={16} height={11} borderRadius={5} style={{ marginBottom: 3 }} />
      </View>
    </View>
  );
}

function StatRowSkeleton() {
  const { spacing } = useDesignSystem();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs / 2 }}>
      <ShimmerBone width={12} height={12} borderRadius={6} />
      <ShimmerBone width={70} height={12} borderRadius={5} />
    </View>
  );
}

export default function AttendanceCardSkeleton() {
  const { colors, spacing, radius, globalStyles, rowDirection } = useDesignSystem();

  return (
    <View style={globalStyles.card}>
      {/* Header: date + status badge */}
      <View style={{ flexDirection: rowDirection, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.xs / 2 }}>
          <ShimmerBone width={64} height={15} borderRadius={5} />
          <ShimmerBone width={80} height={12} borderRadius={5} />
        </View>
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
          <ShimmerBone width={7} height={7} borderRadius={4} />
          <ShimmerBone width={60} height={13} borderRadius={5} />
        </View>
      </View>

      {/* Check-In / Check-Out / Worked Hours */}
      <View
        style={{
          flexDirection: rowDirection,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.xl,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.background,
        }}
      >
        <TimeBlockSkeleton align="flex-start" />
        <TimeBlockSkeleton align="flex-start" />

        <View style={{ gap: spacing.xs / 2, alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ShimmerBone width={14} height={14} borderRadius={7} />
            <ShimmerBone width={65} height={11} borderRadius={5} />
          </View>
          <ShimmerBone width={55} height={18} borderRadius={6} />
        </View>
      </View>

      {/* Shift + Branch */}
      <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
        <StatRowSkeleton />
        <StatRowSkeleton />
      </View>
    </View>
  );
}
