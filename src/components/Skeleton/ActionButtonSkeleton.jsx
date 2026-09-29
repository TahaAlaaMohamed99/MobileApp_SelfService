import { useDesignSystem } from '../../hooks/useDesignSystem';
import ShimmerBone from './ShimmerBone';

export default function ActionButtonSkeleton() {
  const { spacing, radius, iconSize } = useDesignSystem();
  const size = iconSize.md + spacing.sm * 2;

  return <ShimmerBone width={size} height={size} borderRadius={radius.md} />;
}
