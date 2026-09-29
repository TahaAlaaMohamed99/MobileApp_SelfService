import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useUserData } from '../hooks/useUserData';
import { getApi } from '../services/Api';
import { IconNotification } from '../assets/IconsSvg';
import PopupModalSlide from './PopupModalSlide';
import TranslationText from './TranslationText';
import { useFormatNotificationDate } from '../hooks/useFormatDate';
import { useNotificationAction } from '../hooks/useNotificationAction';

const TABS = ['all', 'unread', 'read'];

export default function NotificationToggle() {
  const { colors, spacing, radius, stylesText, iconSize, rowDirection, globalStyles, currentLanguage } = useDesignSystem();
  const { userId } = useUserData();
  const notificationLength = useSelector((state) => state.notificationsSlice.notificationLength);
  const { handleNotificationClick, getNotificationMeta } = useNotificationAction();
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(() => {
    if (!userId) return;

    getApi()
      .get(`Notification/GetAllNotifications?userId=${userId}`)
      .then((res) => {
        setNotifications(res?.data || res || []);
      })
      .catch(() => { });
  }, [userId]);

  const openModal = () => {
    setIsVisible(true);
    fetchNotifications();
  };

  const getFilteredNotifications = () => {
    if (!notifications?.length) return [];

    switch (activeTab) {
      case 'read':
        return notifications.filter((n) => n.isRead === true);
      case 'unread':
        return notifications.filter((n) => n.isRead === false);
      default:
        return notifications;
    }
  };

  const getTabCounts = () => ({
    all: notifications?.length || 0,
    read: notifications?.filter((n) => n.isRead === true).length || 0,
    unread: notifications?.filter((n) => n.isRead === false).length || 0,
  });

  const tabCounts = getTabCounts();
  const filteredData = getFilteredNotifications();

  const renderTabButton = (tab) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity
        key={tab}
        style={{
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.base,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: colors.primary,
        }}
        onPress={() => setActiveTab(tab)}
      >
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2 }}>
          <TranslationText
            title={tab}
            page="GeneralActions"
            style={stylesText({ color: isActive ? 'title' : 'text', size: 'base', weight: isActive ? 'bold' : 'medium' })}
          />
          <Text style={stylesText({ color: 'primary', size: 'sm', weight: 'bold' })}>({tabCounts[tab]})</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item: notif }) => {
    const { pageName, initials, colorPage } = getNotificationMeta(notif);

    return (
      <Pressable
        onPress={() => handleNotificationClick(notif, () => setIsVisible(false))}
        style={({ pressed }) => ({
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.xs,
          borderRadius: radius.md,
          opacity: pressed ? 0.7 : 1,
          gap: spacing.xs,
        })}
      >
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
          <View>
            <View
              style={{
                height: iconSize.lg,
                width: iconSize.lg,
                borderRadius: iconSize.lg / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorPage,
              }}
            >
              <Text style={[stylesText({ size: 'xs', weight: 'semiBold' }), { color: '#fff' }]}>{initials}</Text>
            </View>
            {notif.isRead === false && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  insetInlineStart: -2,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: colors.background,
                  backgroundColor: notif.status == 4 ? colors.error : notif.status != 1 ? colors.success : colors.primary,
                }}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <TranslationText
              page={pageName?.label}
              title="title"
              numberOfLines={1}
              style={stylesText({ color: 'title', size: 'base', weight: 'medium' })}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: rowDirection,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInlineStart: iconSize.lg + spacing.sm,
            gap: spacing.sm,
          }}
        >
          {notif.status == 1 && (
            <Text style={[stylesText({ color: 'text', size: 'sm', weight: 'regular' }), { opacity: 0.85 }]}>{notif.code}</Text>
          )}
          {notif?.name && (
            <Text style={[stylesText({ color: 'text', size: 'sm', weight: 'medium' })]}>
              {notif.name}
            </Text>
          )}

          <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
             <Text style={[stylesText({ color: 'text', size: 'sm', weight: 'medium' }), { opacity: 0.75 }]}>
              {notif?.creationDate ? useFormatNotificationDate(notif.creationDate, currentLanguage) : ''}
            </Text>
          </View>

          {notif.status != 1 && (
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                backgroundColor: notif.status == 4 ? colors.error : colors.success,
              }}
            >
              <TranslationText
                titleGenerallist
                page="StatusWorkFlow?.values"
                title={notif.status == 4 ? 'rejected' : 'approved'}
                style={[stylesText({ size: 'xs', weight: 'medium' }), { color: '#fff' }]}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <TouchableOpacity style={globalStyles.btnHeaderActions} onPress={openModal}>
        <IconNotification color={colors.text} size={iconSize.lg} />
        {notificationLength > 0 && (
          <View
            style={{
              position: 'absolute',
              top: spacing.sm,
              insetInlineEnd: spacing.sm * 1.2,
              minWidth: spacing.sm * 1.2,
              height: spacing.sm * 1.2,
              borderRadius: spacing.md,
              paddingHorizontal: 3,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >

          </View>
        )}
      </TouchableOpacity>

      <PopupModalSlide
        isVisible={isVisible}
        toggleClick={() => setIsVisible(false)}
        title="notifications"
        ResourcePage="GeneralActions"
        icon={<IconNotification color={colors.title} size={iconSize.md} />}
        sublength={notifications?.length || 0}
        isfooter={false}
      >
        <View style={{ flexDirection: rowDirection, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm }}>
          {TABS.map(renderTabButton)}
        </View>

        {filteredData?.length > 0 ? (
          <FlashList
            data={filteredData}
            keyExtractor={(item) => String(item.recId)}
            renderItem={renderNotification}
            ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TranslationText title="noData" page="GeneralActions" style={stylesText({ color: 'text', size: 'base', weight: 'regular' })} />
          </View>
        )}
      </PopupModalSlide>
    </>
  );
}
