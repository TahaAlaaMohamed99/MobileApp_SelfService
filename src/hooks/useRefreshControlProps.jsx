import { useDesignSystem } from './useDesignSystem';

/**
 * Shared themed color props for native RefreshControl.
 * Must be spread onto a literal <RefreshControl /> element passed to a
 * ScrollView/FlatList/FlashList `refreshControl` prop — that prop requires
 * the element itself to be a RefreshControl, not a wrapping component,
 * otherwise the scroll container fails to recognize it (causing render loops).
 */
export function useRefreshControlProps() {
  const { colors } = useDesignSystem();

  return {
    tintColor: colors.primary,
    colors: [colors.primary],
    progressBackgroundColor: colors.background,
  };
}
