import React from 'react';
import { Image, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styles/faceAttendance.styles';

export function SuccessMessage({
  userName,
  userId,
  time,
  sentToOdoo = false,
  imageUri,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.successMessageContainer, { marginTop: insets.top + 8 }]}>
      <View style={styles.successMessageContent}>
        <MaterialIcons name="check-circle" size={30} color="white" />
        <View style={styles.messageTextContainer}>
          <Text style={styles.successMessageTitle}>Attendance Recorded!</Text>
          {userName && <Text style={styles.successMessageText}>Name: {userName}</Text>}
          {userId && <Text style={styles.successMessageText}>ID: {userId}</Text>}
          <Text style={styles.successMessageText}>Time: {time}</Text>
          <Text style={styles.successMessageText}>
            Odoo Sync: {sentToOdoo ? 'Success ✓' : 'Pending...'}
          </Text>
          {imageUri && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={styles.successMessageText}>Sent Image:</Text>
              <View
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#eee',
                  marginTop: 4,
                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 120, height: 120, borderRadius: 8 }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function ErrorMessage({ reason, time }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.errorMessageContainer, { marginTop: insets.top + 8 }]}>
      <View style={styles.errorMessageContent}>
        <MaterialIcons name="error" size={30} color="white" />
        <View style={styles.messageTextContainer}>
          <Text style={styles.errorMessageTitle}>Face Not Recognized</Text>
          <Text style={styles.errorMessageText}>Reason: {reason}</Text>
          <Text style={styles.errorMessageText}>Time: {time}</Text>
          <Text style={styles.errorMessageText}>
            Please try again or enter ID manually.
          </Text>
        </View>
      </View>
    </View>
  );
}
