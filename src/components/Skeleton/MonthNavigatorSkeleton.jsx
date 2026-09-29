import { View } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import ShimmerBone from './ShimmerBone';

export default function MonthNavigatorSkeleton() {
  const { spacing, rowDirection, iconSize,rf,} = useDesignSystem();

  return (
    <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
        <ShimmerBone width={iconSize.lg} height={iconSize.lg} borderRadius={4} />
        <ShimmerBone width={rf(100)} height={iconSize.lg} borderRadius={6} />
      </View>
      <ShimmerBone width={iconSize.lg} height={iconSize.lg} borderRadius={8} />
      <ShimmerBone width={iconSize.lg} height={iconSize.lg} borderRadius={8} />
    </View>
  );
}
