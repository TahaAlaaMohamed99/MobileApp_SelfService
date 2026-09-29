import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { Pages } from '../../../ConfigData/Pages';
import { useDesignSystem } from '../../../hooks/useDesignSystem';
import { useTabScreenOptions } from '../../../hooks/useTabScreenOptions';
import useTranslationText from '../../../hooks/useTranslationText';
import { useNotificationCount } from '../../../hooks/useNotificationCount';


export default function TabsLayout() {
  const { currentLanguage, fonts, isRTL } = useDesignSystem();
  const screenOptions = useTabScreenOptions();
  useNotificationCount();

  return (
    <Tabs
      screenOptions={({ route }) => {
        if (route.name === 'Profile') {
          return { ...screenOptions, tabBarStyle: { display: 'none' } };
        }

        const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'index';
        if (focusedRouteName !== 'index') {
          return { ...screenOptions, tabBarStyle: { display: 'none' } };
        }

        return screenOptions;
      }}
      backBehavior="history"
    >
      {Pages.map((page) => {
        const visible = page.showBottomNavigation == true;
        const options = {
          title: useTranslationText({ page: page.keyPage, title: 'title', lang: currentLanguage }),
          tabBarIcon: ({ color, size, focused }) => {
            const Icon = focused && page.iconActive ? page.iconActive : page.icon;
            if (!Icon) return null;
            return (
              <View style={{ opacity: page.disabled ? 0.4 : 1 }}>
                <Icon color={color} size={size} solid={focused} />
              </View>
            );
          },
          tabBarLabel: ({ color, focused, children }) => (
            <Text style={{ color, fontFamily: focused ? fonts.bold : fonts.medium, fontSize: 11, writingDirection: isRTL ? 'rtl' : 'ltr', opacity: page.disabled ? 0.4 : 1 }}>
              {children}
            </Text>
          ),
        };

        if (visible != true) {
          options.href = null;
        }

        if (page.headerShown == false) {
          options.headerShown = false;
        }

        const listeners = page.disabled
          ? { tabPress: (e) => e.preventDefault() }
          : undefined;

        return <Tabs.Screen key={page.keyPage} name={page.keyPage} options={options} listeners={listeners} />;
      })}

      <Tabs.Screen
        name="Profile"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}
