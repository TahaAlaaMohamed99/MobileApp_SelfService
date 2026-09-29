import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import AutoFontText from './AutoFontText';
import TranslationText from './TranslationText';
import { useNotificationAction } from '../hooks/useNotificationAction';
import { useFormatNotificationDate } from '../hooks/useFormatDate';
import { IconClose } from '../assets/IconsSvg';

const NotificationToast = ({ notif: directNotif, props: customProps, onPress, hide }) => {
  const notif = customProps?.notif || directNotif;
  const { colors, spacing, radius, iconSize, stylesText, currentLanguage, rowDirection } = useDesignSystem();
  const { getNotificationMeta, handleNotificationClick } = useNotificationAction();

  if (!notif) return null;

  const { pageName, initials, colorPage } = getNotificationMeta(notif);

  const dotColor =
    notif.status === 4
      ? colors.error
      : notif.status !== 1
        ? colors.success
        : colors.primary;

  const handlePress = () => {
    if (typeof onPress === 'function') {
      onPress(notif);
    } else {
      handleNotificationClick(notif);
    }
    hide?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={{
        width: '92%',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          <View
            style={{
              height: iconSize.lg,
              width: iconSize.lg,
              borderRadius: iconSize.lg / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorPage || colors.primary,
            }}
          >
            <Text style={[stylesText({ size: 'xs', weight: 'semiBold' }), { color: '#fff' }]}>
              {initials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <TranslationText
              page={pageName?.label}
              title="title"
              numberOfLines={1}
              style={stylesText({ color: 'title', size: 'sm', weight: 'medium' })}
            />
          </View>
        </View>

        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
          {notif.isRead === false && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotColor,
              }}
            />
          )}
          <TouchableOpacity onPress={() => hide?.()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconClose color={colors.text} size={iconSize.sm} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          paddingInlineStart: iconSize.lg + spacing.sm,
          flexDirection: rowDirection,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        {notif.status === 1 && notif.code ? (
          <AutoFontText value={notif.code} color="text" size="sm" weight="medium" />
        ) : null}

        {notif.name ? (
          <AutoFontText value={notif.name} color="text" size="sm" weight="medium" />
        ) : null}

        <Text style={[stylesText({ color: 'text', size: 'sm', weight: 'medium' }), { opacity: 0.75 }]}>
          {notif?.creationDate ? useFormatNotificationDate(notif.creationDate, currentLanguage) : ''}
        </Text>

        {notif.status !== 1 && (
          <View
            style={{
              backgroundColor: notif.status === 4 ? colors.error : colors.success,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs / 2,
              borderRadius: radius.sm,
            }}
          >
            <TranslationText
              titleGenerallist
              page="StatusWorkFlow?.values"
              title={notif.status === 4 ? 'rejected' : 'approved'}
              style={[stylesText({ size: 'xs', weight: 'medium' }), { color: '#fff' }]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationToast;