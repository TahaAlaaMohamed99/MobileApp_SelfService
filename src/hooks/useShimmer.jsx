import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

export function useShimmer(duration = 1200) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  return progress;
}