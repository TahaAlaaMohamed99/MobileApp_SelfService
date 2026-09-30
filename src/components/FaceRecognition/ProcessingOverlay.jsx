import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styles/faceAttendance.styles';

export function ProcessingOverlay({ isProcessing }) {
  const insets = useSafeAreaInsets();

  if (!isProcessing) return null;

  return (
    <View
      style={[
        styles.processingOverlay,
        { paddingBottom: insets.bottom + 8, paddingTop: insets.top + 8 },
      ]}
    >
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.processingText}>Processing...</Text>
    </View>
  );
}
