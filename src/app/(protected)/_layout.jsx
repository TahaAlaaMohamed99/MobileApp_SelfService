import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer } from 'expo-router/drawer';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { useGeneralParameter } from '../../hooks/useGeneralParameter';
import { useSignalR } from '../../hooks/useSignalR';
import useToast from '../../hooks/useToast';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useNotificationAction } from '../../hooks/useNotificationAction';
import { setNotificationLength } from '../../store/NotificationsSlice';

export default function ProtectedLayout() {
  const { colors, isRTL } = useDesignSystem();
  useGeneralParameter();
  const { isConnected, on, off } = useSignalR();
  const { playNotificationSound } = useNotificationSound();
  const { handleNotificationClick } = useNotificationAction();
  const dispatch = useDispatch();
  const toast = useToast();
  const notificationLength = useSelector((state) => state.notificationsSlice.notificationLength);

  useEffect(() => {
    if (isConnected) {
      on(
        'ReceiveNotification',
        (notificationId, transactionRecId, transactionName, code, status) => {
          const newNotification = {
            recId: notificationId,
            transactionRecId,
            transactionName,
            code,
            status,
            isRead: false,
            creationDate: new Date(),
          };

          playNotificationSound();
          dispatch(setNotificationLength(Number(notificationLength || 0) + 1));

          toast.notification(newNotification, () => {
            handleNotificationClick(newNotification);
          });
        }
      );
    }

    return () => {
      if (isConnected) {
        off('ReceiveNotification');
      }
    };
  }, [isConnected, on, off, notificationLength, playNotificationSound, handleNotificationClick]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: 'front',
        swipeEnabled: true,
        drawerStyle: { backgroundColor: colors.background, width: '80%' },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Home', drawerLabel: 'Home' }} />
    </Drawer>
  );
}
