import { useCallback, useEffect } from 'react';
import { Vibration, Platform } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import NOTIFICATIONSOUND from '../assets/notification.mp3';
 
export const useNotificationSound = () => {
  const player = useAudioPlayer(NOTIFICATIONSOUND);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => {});
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      Vibration.vibrate(Platform.OS === 'android' ? 300 : [0, 200]);
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      // Fallback: vibration already triggered
    }
  }, [player]);

  return { playNotificationSound };
};

export default useNotificationSound;
