import { View } from 'react-native';
import HeaderLeft from '../components/HeaderLeft';
import NotificationToggle from '../components/NotificationToggle';
import ProfileToggle from '../components/ProfileToggle';
import { useDesignSystem } from './useDesignSystem';

export function useTabScreenOptions() {
  const { colors, fonts, spacing, rowDirection } = useDesignSystem();

  return {
    headerLeft: () => <HeaderLeft />,
    headerRight: () => (
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        <NotificationToggle />
        <ProfileToggle />
      </View>
    ),
    headerTitle: () => null,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.title, fontFamily: fonts.semiBold },
    headerShadowVisible: false,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.text,
    tabBarLabelStyle: { fontFamily: fonts.medium },
  };
}
