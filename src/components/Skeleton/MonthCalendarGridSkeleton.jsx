import { View } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import ShimmerBone from './ShimmerBone';

const WEEK_COUNT = 6;
const DAY_COUNT = 7;

export default function MonthCalendarGridSkeleton() {
  const { spacing, rowDirection, width } = useDesignSystem();
  const cellSize = (width - spacing.base * 2) / DAY_COUNT;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: rowDirection }}>
        {Array.from({ length: DAY_COUNT }).map((_, index) => (
          <View key={index} style={{ width: cellSize, alignItems: 'flex-start', paddingBottom: spacing.xs, marginHorizontal: 2 }}>
            <ShimmerBone width={20} height={11} borderRadius={4} />
          </View>
        ))}
      </View>

      {Array.from({ length: WEEK_COUNT }).map((_, weekIndex) => (
        <View key={weekIndex} style={{ flex: 1, flexDirection: rowDirection }}>
          {Array.from({ length: DAY_COUNT }).map((_, dayIndex) => (
            <View
              key={dayIndex}
              style={{ width: cellSize, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: spacing.xs, paddingHorizontal: 3 }}
            >
              <ShimmerBone width={20} height={20} borderRadius={6} />
              <ShimmerBone width={cellSize - 10} height={6} borderRadius={3} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
