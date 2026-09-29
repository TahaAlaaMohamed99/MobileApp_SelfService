import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { IconNoInternet } from '../assets/IconsSvg';
import TranslationText from './TranslationText';
import CustomeBtn from './CustomeBtn';

export default function NoInternet() {
  const { colors, spacing, radius, stylesText, rf } = useDesignSystem();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleTryAgain = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
      zIndex: 9999,
    },

    textContainer: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    button: {
      marginTop: spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <IconNoInternet color={colors.text} size={rf(140)} />
      <View style={styles.textContainer}>
        <TranslationText
          page="GeneralMessages"
          title="noInternetTitle"
          style={[stylesText({ color: 'title', size: 'lg', weight: 'bold' })]}
        />
        <TranslationText
          page="GeneralMessages"
          title="noInternetDescription"
          style={[stylesText({ color: 'text', size: 'base', weight: 'medium' }) , { textAlign: 'center' }]}
        />
      </View>
      <CustomeBtn
        title="tryAgain"
        onPress={handleTryAgain}
        disabled={isRetrying}
        type="primary"
        size="btn_lg"
        isLoading={isRetrying}
        ResourcePage="GeneralMessages"
        style={styles.button}
      />
    </View>
  );
}
