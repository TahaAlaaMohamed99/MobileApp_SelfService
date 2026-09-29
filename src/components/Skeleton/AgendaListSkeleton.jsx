import { View } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import ShimmerBone from './ShimmerBone';

const ROW_COUNT = 30;

export default function AgendaListSkeleton() {
  const { colors, spacing, radius, rowDirection } = useDesignSystem();

  return (
    <View>
      {Array.from({ length: ROW_COUNT }).map((_, index) => (
        <View key={index}>
          <View style={{ flexDirection: rowDirection, paddingVertical: spacing.sm }}>
            <View style={{ width: 56, gap: spacing.xs / 2 }}>
              <ShimmerBone width={26} height={12} borderRadius={5} />
              <ShimmerBone width={22} height={20} borderRadius={5} />
            </View>

            <View style={{ flex: 1 }}>
              <ShimmerBone
                width="70%"
                height={36}
                borderRadius={radius.md}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />
        </View>
      ))}
    </View>
  );
}
