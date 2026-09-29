import { Stack } from 'expo-router';
 import NotificationToggle from '../../../../components/NotificationToggle';
import BackToggle from '../../../../components/BackToggle';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { View } from 'react-native';
import TranslationText from '../../../../components/TranslationText';
import AutoFontText from '../../../../components/AutoFontText';
import { useUserData } from '../../../../hooks/useUserData';

export default function ProfileLayout() {
  const { CompanyName } = useUserData();

  const { colors, fonts, spacing, rowDirection, stylesText } = useDesignSystem();
  const tabOptions = {
    headerLeft: () => <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
      <BackToggle />
      <View>
        {CompanyName && (
          <AutoFontText value={CompanyName} color="text" size="sm" weight="medium" numberOfLines={1} />
        )}
        <TranslationText
          page={"Profile"}
          title="title"
          style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
          numberOfLines={1}
        />
      </View>

    </View>,
    headerRight: () => (
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

  const customHeaderOptions = (page) => ({
    headerLeft: () => <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
      <BackToggle />
      <TranslationText
        page={page}
        title="title"
        style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
        numberOfLines={1}
      />
    </View>,
    headerTitle: () => null,
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
  });

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Profile' }} />
      <Stack.Screen name="EmployeeBank" options={{ headerShown: false }}
      />
      <Stack.Screen name="EmployeeAddress" options={{ headerShown: false }}
      />
        <Stack.Screen name="ResetPassword" options={{ headerShown: false }}
      />
    </Stack>
  );
}
