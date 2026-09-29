import { View } from 'react-native';
import { router } from 'expo-router';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { IconNotData, IconArrow } from '../assets/IconsSvg';
import TranslationText from './TranslationText';
import CustomeBtn from './CustomeBtn';

export default function UnderDevelopment() {
  const { colors, spacing, stylesText, isRTL } = useDesignSystem();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
      <IconNotData color={colors.primary} />
      <TranslationText
        page="Grid"
        title="underDevelopment"
        style={stylesText({ color: 'title', size: 'lg', weight: 'bold' })}
      />
      <CustomeBtn
        title="back"
        ResourcePage="Grid"
        type="outline"
        size="btn_md"
        icon={
          <View style={isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
            <IconArrow color={colors.primary} size={18} />
          </View>
        }
        onPress={() => router.back()}
      />
    </View>
  );
}
