import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function AutoCaptureIndicator({
  isActive,
  onToggle,
  nextCaptureTime,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { borderColor: isActive ? '#007AFF' : 'transparent', borderWidth: 1 },
        ]}
        onPress={onToggle}
      >
        <MaterialIcons
          name={isActive ? 'schedule' : 'timer-off'}
          size={16}
          color={isActive ? '#007AFF' : '#FFFFFF'}
        />
        <Text style={styles.toggleText}>Auto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
    color: 'white',
  },
});
