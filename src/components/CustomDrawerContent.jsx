import { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { DrawerContentScrollView } from 'expo-router/drawer';
import { DrawerActions } from 'expo-router/react-navigation';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Pages } from '../ConfigData/Pages';
import TranslationText from './TranslationText';
import { LogoName } from '../assets/IconsSvg';

export default function CustomDrawerContent(props) {
  const pathname = usePathname();
  const { colors, fonts, spacing, iconSize, text, radius, rowDirection, wp } = useDesignSystem();



  const handleNavigate = (href) => {
    try {
      props.navigation?.dispatch(DrawerActions.closeDrawer());
    } catch {
      props.navigation?.closeDrawer?.();
    }
    router.push(href);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: colors.background, flexGrow: 1 }}
    >
      <View style={{ paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <LogoName
          width={wp(58)}
          height={wp(16)}
          colors={{ dark: colors.title, primary: colors.primary }}
        />
      </View>

      <View style={{ flex: 1, paddingVertical: spacing.sm }}>
        {Pages.map((page) => {
          const href = `/${page.keyPage}`;
          const isActive = pathname === href;
          const Icon = page.icon;
          return (
            page?.showBottomNavigation !== true && (
              <TouchableOpacity
                key={page.keyPage}
                disabled={page.disabled}
                onPress={() => handleNavigate(href)}
                style={{
                  flexDirection: rowDirection,
                  alignItems: 'center',
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  paddingVertical: spacing.md,
                  backgroundColor: isActive ? colors.surface : 'transparent',
                  opacity: page.disabled ? 0.4 : 1,
                }}
              >
                {Icon && <Icon color={isActive ? colors.primary : colors.text} size={iconSize.lg} />}
                <TranslationText
                  page={page.keyPage}
                  title="title"
                  style={{
                    fontSize: text.md,
                    color: isActive ? colors.primary : colors.text,
                    fontFamily: isActive ? fonts.bold : fonts.medium,
                    marginStart: spacing.sm,
                  }}
                />
              </TouchableOpacity>
            )
          );
        })}
      </View>




    </DrawerContentScrollView>
  );
}
