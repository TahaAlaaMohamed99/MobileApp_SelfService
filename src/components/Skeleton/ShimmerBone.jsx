import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useShimmer } from '../../hooks/useShimmer';

export default function ShimmerBone({ width, height, borderRadius, color = 'rgba(0,0,0,0.12)', style }) {
  const boneWidth = useSharedValue(typeof width === 'number' ? width : 0);
 const progress = useShimmer();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value * 2 - 1) * boneWidth.value }],
  }));

  return (
    <View
      onLayout={(e) => {
        if (typeof width !== 'number') {
          boneWidth.value = e.nativeEvent.layout.width;
        }
      }}
      style={[{ width, height, borderRadius, backgroundColor: color, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}