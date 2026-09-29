import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { useDesignSystem } from '../../hooks/useDesignSystem';

export default function CustomSwitch({
  value,
  onValueChange,
  disabled = false,
  duration = 200,
  style,
}) {
  const { colors, spacing, radius, isRTL, currentShadow } = useDesignSystem();

  const trackPadding = spacing.xs / 2;
  const trackWidth = spacing.xxl + spacing.md;
  const trackHeight = spacing.xl;
  const thumbSize = trackHeight - trackPadding * 2;
  const thumbTravel = trackWidth - thumbSize - trackPadding * 2;

  const progress = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration });
  }, [value, duration]);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: disabled
      ? colors.disabled
      : interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(progress.value, [0, 1], isRTL ? [0, -thumbTravel] : [0, thumbTravel]);
    return {
      transform: [{ translateX: moveValue }],
    };
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange?.(!value)}
      disabled={disabled}
      style={style}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: radius.full,
            padding: trackPadding,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          },
          trackAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: colors.surface,
              ...currentShadow,
            },
            thumbAnimatedStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {},
  thumb: {},
});
