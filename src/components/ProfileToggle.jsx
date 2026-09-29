import { Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useUserData } from '../hooks/useUserData';
import useImage from '../hooks/useImage';

export default function ProfileToggle() {
  const { colors, globalStyles, iconSize } = useDesignSystem();
  const { EmployeeImage } = useUserData();
  const imageUri = useImage(EmployeeImage);

  return (
    <TouchableOpacity style={[globalStyles.btnHeaderActions, { padding: 0, overflow: "hidden", borderColor: colors.border, borderWidth: 1 }]} onPress={() => router.push('/Profile')}>
      {EmployeeImage != "" || EmployeeImage != null ? (
        <Image resizeMode="cover"
          source={{ uri: imageUri }}  style={{ width: "100%", height: "100%" }} />
      ) : (
       <Image source=
        {require(`${"./../assets/images/avatarMan.png"}`)}
        style={{ width: "100%", height: "100%" }}
      />
      )}
      
    </TouchableOpacity>
  );
}
