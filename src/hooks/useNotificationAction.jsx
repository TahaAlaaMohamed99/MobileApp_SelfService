import { useCallback } from 'react';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { getApi } from '../services/Api';
import { setNotificationLength } from '../store/NotificationsSlice';
import Generallist from '../ConfigData/Generallist.json';
import { useDesignSystem } from './useDesignSystem';

export const ROUTABLE_TRANSACTIONS = [
  'VacationTransaction',
  'AttendanceException',
  'Mission',
  'PartialDayLeave',
  'MissedAttendanceRequest',
];

const darkColorsTransactionNameList = {
  1: '#2e7d32',
  2: '#1565c0',
  3: '#b71c1c',
  4: '#ef6c00',
  5: '#6a1b9a',
  6: '#212121',
  7: '#fbc02d',
};

const lightColorsTransactionNameList = {
  1: '#81c784',
  2: '#64b5f6',
  3: '#e57373',
  4: '#ffb74d',
  5: '#ba68c8',
  6: '#9e9e9e',
  7: '#fff176',
};

const transactionNameList = Generallist['TransactionName'] || [];

export const useNotificationAction = () => {
  const dispatch = useDispatch();
  const { isDark } = useDesignSystem();
  const notificationLength = useSelector((state) => state.notificationsSlice.notificationLength);

  const colorsTransactionNameList = isDark
    ? lightColorsTransactionNameList
    : darkColorsTransactionNameList;

  const getNotificationMeta = useCallback(
    (notif) => {
      const pageName = transactionNameList.find((t) => t.value === notif?.transactionName);
      const label = pageName?.label;
      const isRoutable = !!(label && ROUTABLE_TRANSACTIONS.includes(label));

      return {
        pageName,
        label,
        isRoutable,
        initials: label?.slice(0, 2).toUpperCase() || '??',
        colorPage: colorsTransactionNameList[pageName?.value] || '#000',
      };
    },
    [colorsTransactionNameList]
  );

  const handleNotificationClick = useCallback(
    (notif, onComplete) => {
      if (!notif) return;

      const { label, isRoutable } = getNotificationMeta(notif);

      const closeAndMaybeNavigate = () => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        if (isRoutable && notif.transactionRecId) {
          router.push(`/${label}/${notif.transactionRecId}`);
        }
      };

      if (notif.isRead === false && notif.recId) {
        getApi()
          .put(`Notification/ReadNotification?RecId=${notif.recId}`)
          .then(() => {
            dispatch(setNotificationLength(Math.max(0, (notificationLength || 1) - 1)));
            closeAndMaybeNavigate();
          })
          .catch(closeAndMaybeNavigate);
      } else {
        closeAndMaybeNavigate();
      }
    },
    [dispatch, notificationLength, getNotificationMeta]
  );

  return {
    handleNotificationClick,
    getNotificationMeta,
    ROUTABLE_TRANSACTIONS,
  };
};

export default useNotificationAction;
