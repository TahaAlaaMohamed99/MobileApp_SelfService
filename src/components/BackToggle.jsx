import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { IconBack } from '../assets/IconsSvg';

export default function BackToggle() {
  const { colors, globalStyles, iconSize, isRTL } = useDesignSystem();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[globalStyles.btnHeaderActions]}
    >
      <View style={isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
        <IconBack color={colors.text} size={iconSize.lg} />
      </View>
    </TouchableOpacity>
  );
}
