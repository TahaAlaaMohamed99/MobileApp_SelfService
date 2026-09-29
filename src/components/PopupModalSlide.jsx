import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, ActivityIndicator, StyleSheet } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';
import CustomeBtn from './CustomeBtn';
import { IconClose } from '../assets/IconsSvg';

export default function PopupModalSlide({
  isVisible,
  toggleClick,
  submitClick,
  modalWidth,
  title,
  icon,
  children,
  titleSubmitBtn,
  titleCancel,
  CancelClick,
  isfooter = true,
  ResourcePage = 'General',
  ResourceBtns = '',
  isLoadingSubmit = false,
  isLoading = false,
  notShowenButtons = false,
  viewOnly = false,
  disabledSubmitBtn = false,
  ResourceSubmitBtn,
  sublength,
  subTitle = null,
}) {
  const { colors, spacing, shadows, stylesText, isRTL, rowDirection, width, isLargeTablet, iconSize } = useDesignSystem();

  const panelWidth = modalWidth ?? (isLargeTablet ? width * 0.5 : width);
  const hiddenX = isRTL ? -panelWidth : panelWidth;

  const translateX = useRef(new Animated.Value(hiddenX)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      Animated.timing(overlayOpacity, { toValue: 0.5, duration: 250, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateX, { toValue: hiddenX, duration: 250, useNativeDriver: true }).start();
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setModalVisible(false);
      });
    }
  }, [isVisible]);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={toggleClick}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            styles.panel,
            shadows.custom,
            {
               width: panelWidth,
              backgroundColor: colors.background,
              transform: [{ translateX }],
            },
          ]}
        >
          {isLoading && (
            <View style={[StyleSheet.absoluteFillObject, styles.loaderOverlay, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          <View style={[styles.header, { flexDirection: rowDirection, borderBottomColor: colors.border, padding: spacing.base }]}>
            <View style={[styles.headerInfo, { flexDirection: rowDirection, gap: spacing.sm }]}>
              {icon && <View>{icon}</View>}
              <Text style={[stylesText({ color: 'title', size: 'lg', weight: 'bold' }), { flexShrink: 1 }]} numberOfLines={1}>
                <TranslationText title={title} page={ResourcePage} />
                {subTitle != null && (
                  <>
                    {' '}
                    <TranslationText title={subTitle} page={ResourcePage} />
                  </>
                )}
                {sublength != null && (
                  <Text style={stylesText({ color: 'primary', size: 'sm', weight: 'medium' })}> ({sublength})</Text>
                )}
              </Text>
            </View>

            <TouchableOpacity onPress={toggleClick}>
              <IconClose color={colors.title} size={iconSize.lg} />
            </TouchableOpacity>
          </View>

          <View style={[styles.content, { padding: spacing.base }]}>
            {!isLoading && children}
          </View>

          {isfooter && !notShowenButtons && (
            <View style={[styles.footer, { flexDirection: rowDirection, gap: spacing.sm, padding: spacing.base, borderTopColor: colors.border }]}>
              <CustomeBtn
                title={titleCancel || 'cancel'}
                type="outline"
                style={{ flex: 1 }}
                ResourcePage={ResourceBtns || 'General'}
                onPress={CancelClick || toggleClick}
              />
              <CustomeBtn
                title={titleSubmitBtn}
                type="primary"
                style={{ flex: 1 }}
                isLoading={isLoadingSubmit}
                ResourcePage={ResourceBtns || ResourceSubmitBtn || 'General'}
                disabled={viewOnly || disabledSubmitBtn}
                onPress={submitClick}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
   },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loaderOverlay: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTopWidth: 1,
  },
});
