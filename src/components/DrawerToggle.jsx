import { TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { IconMenu } from '../assets/IconsSvg';

export default function DrawerToggle() {
  const navigation = useNavigation();
  const { colors, globalStyles, iconSize } = useDesignSystem();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={[globalStyles.btnHeaderActions ]}
    >
      <IconMenu color={colors.text} size={iconSize.lg} />
    </TouchableOpacity>
  );
}
