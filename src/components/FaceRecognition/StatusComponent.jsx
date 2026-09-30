import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styles/faceAttendance.styles';

export function StatusComponent({
  isProcessing,
  countdownActive,
  onStartCountdown,
  faceDetected = false,
  inCooldown = false,
  cooldownRemaining = 0,
  faceCentered = false,
}) {
  const insets = useSafeAreaInsets();

  const formatCooldownTime = () => {
    const totalSeconds = Math.ceil(cooldownRemaining / 1000);
    if (totalSeconds <= 0) {
      return 'just a moment';
    }
    return `${totalSeconds} ${totalSeconds === 1 ? 'second' : 'seconds'}`;
  };

  return (
    <View style={[styles.statusContainer, { marginBottom: insets.bottom + 8 }]}>
      <Text style={styles.statusText}>
        Status:{' '}
        {isProcessing
          ? 'Processing'
          : countdownActive
            ? 'Capturing'
            : inCooldown
              ? 'Cooldown'
              : 'Auto Scanning'}
      </Text>
      {isProcessing && faceDetected && (
        <Text style={[styles.statusText, { fontWeight: 'bold', color: '#4CAF50' }]}>
          Face captured — processing...
        </Text>
      )}

      {countdownActive && (
        <Text style={styles.statusText}>Look at the camera and stay still</Text>
      )}

      {inCooldown && (
        <Text style={[styles.statusText, { color: '#2196F3', fontWeight: 'bold' }]}>
          Attendance recorded! Please wait {formatCooldownTime()}
        </Text>
      )}

      {!countdownActive && !isProcessing && !inCooldown && (
        <>
          {faceDetected ? (
            <Text
              style={[
                styles.statusText,
                { fontWeight: 'bold', color: '#4CAF50' },
              ]}
            >
              Face detected - stay still
            </Text>
          ) : (
            <Text
              style={[
                styles.statusText,
                { color: '#F44336', fontStyle: 'italic' },
              ]}
            >
              No face detected - please stand in front of camera
            </Text>
          )}
          {faceDetected && !faceCentered && (
            <Text style={[styles.statusText, { color: '#FFD54F' }]}>
              Make sure your face is centered in the frame
            </Text>
          )}
        </>
      )}
    </View>
  );
}
