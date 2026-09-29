import { View } from 'react-native';
import TranslationText from '../components/TranslationText';
import BackToggle from '../components/BackToggle';
import NotificationToggle from '../components/NotificationToggle';
import { useDesignSystem } from './useDesignSystem';

export const useSimpleTabOptions = (page, keyTitle = 'title', showNotification = true) => {
  const { colors, fonts, spacing, rowDirection, stylesText } = useDesignSystem();
  return {
    headerLeft: () => (
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        <BackToggle />
        <TranslationText
          page={page}
          title={keyTitle}
          style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
          numberOfLines={1}
        />
      </View>
    ),
    headerRight: () => (showNotification &&
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        <NotificationToggle />
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
};
