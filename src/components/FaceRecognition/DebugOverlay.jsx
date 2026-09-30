import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function DebugOverlay({
  visible,
  verifying,
  lastFrame,
  pollAttempts = 0,
  elapsedMs = 0,
  liveFacePresent = false,
  postCooldownHold,
}) {
  if (!visible) return null;

  const holdRemaining = postCooldownHold ? Math.max(0, postCooldownHold - Date.now()) : 0;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <ScrollView>
        <Text style={styles.title}>Debug Overlay</Text>
        <Text style={styles.text}>Verifying: {verifying ? 'YES' : 'NO'}</Text>
        <Text style={styles.text}>Poll attempts: {pollAttempts}</Text>
        <Text style={styles.text}>Elapsed ms: {elapsedMs}</Text>
        <Text style={styles.text}>Live face present: {liveFacePresent ? 'YES' : 'NO'}</Text>
        <Text style={styles.text}>
          Last frame ts:{' '}
          {lastFrame?.ts
            ? new Date(lastFrame.ts).toLocaleTimeString() + '.' + (lastFrame.ts % 1000)
            : 'N/A'}
        </Text>
        <Text style={styles.text}>
          Last frame bounds: {lastFrame?.bounds ? JSON.stringify(lastFrame.bounds) : 'N/A'}
        </Text>
        <Text style={styles.text}>Post cooldown hold ms remaining: {holdRemaining}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 24,
    right: 12,
    left: 12,
    maxHeight: 220,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'white',
  },
  text: {
    color: 'white',
  },
});
