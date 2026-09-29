import React, { useMemo } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { hideErrorSheet } from '../../store/errorSheetSlice';
import TranslationText from '../TranslationText';
import AutoFontText from '../AutoFontText';
import { IconClose } from '../../assets/IconsSvg';

/**
 * Redux-driven ErrorBottomSheet — mount once at the app root.
 * Open it from anywhere via: dispatch(showErrorSheet({ errors, ResourcePage }))
 */
export default function ErrorBottomSheet() {
  const dispatch = useDispatch();
  const { colors, spacing, radius, iconSize, stylesText } = useDesignSystem();

  const { isOpen, errors, ResourcePage, headerTitle } = useSelector((state) => state.errorSheetSlice);

  const handleClose = () => dispatch(hideErrorSheet());

  const renderMessage = (msg, key) => (
    <View
      key={key}
      style={{
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: spacing.md,
        marginTop: spacing.sm,
      }}
    >
      <AutoFontText value={msg} style={stylesText({ color: 'title', size: 'sm' })} />
    </View>
  );

  const renderGroupTitle = (label) => (
    <AutoFontText
      value={label}
      weight="medium"
      style={[stylesText({ color: 'title', size: 'md', weight: 'medium' }), { marginTop: spacing.md }]}
    />
  );

  const content = useMemo(() => {
    if (typeof errors === 'string') {
      return renderMessage(errors, 'single');
    }

    if (Array.isArray(errors) && errors.length > 0 && errors.every((e) => typeof e === 'string')) {
      return errors.map((msg, i) => renderMessage(msg, i));
    }

    if (Array.isArray(errors) && errors.some((e) => typeof e === 'object' && e?.message)) {
      return errors.map((item, index) => (
        <View key={index}>
          {renderGroupTitle(item.key1 && item.key2 ? `${item.key1} : ${item.key2}` : item.key1 || item.key2 || 'Errors')}
          {Array.isArray(item?.message) && item.message.map((msg, i) => renderMessage(msg, i))}
        </View>
      ));
    }

    return <AutoFontText value="No errors to display" style={stylesText({ color: 'text', size: 'md' })} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, colors, spacing, iconSize, stylesText]);

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

      <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
            <TranslationText
              page="General"
              title={headerTitle || 'errors'}
              style={stylesText({ color: 'error', size: 'lg', weight: 'bold' })}
            />
            {ResourcePage && (
              <TranslationText page={ResourcePage} title="title" style={stylesText({ color: 'title', size: 'lg', weight: 'bold' })} />
            )}
          </View>
         
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.lg }}>{content}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  sheet: {
    maxHeight: '85%',
    minHeight: '30%',
  },
});
