import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styles/faceAttendance.styles';

export function IdInputForm({ visible, isProcessing, onSubmit, onCancel }) {
  const [userId, setUserId] = useState('');
  const [inputError, setInputError] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [containerPosition, setContainerPosition] = useState(80);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        const keyboardHeight = event.endCoordinates ? event.endCoordinates.height : 300;
        setContainerPosition(keyboardHeight + 5);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setContainerPosition(80);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  if (!visible) return null;

  const handleSubmit = () => {
    if (!userId.trim()) {
      setInputError('ID cannot be empty');
      return;
    }
    setInputError(null);
    onSubmit(userId.trim());
    setUserId('');
    Keyboard.dismiss();
  };

  const dynamicContainerStyle = {
    ...styles.idInputContainer,
    bottom: Math.max(containerPosition, insets.bottom + 12),
    backgroundColor: keyboardVisible ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)',
    padding: keyboardVisible ? 12 : 15,
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={dynamicContainerStyle}>
        <Text
          style={[
            styles.idInputLabel,
            keyboardVisible && { fontSize: 15, marginBottom: 8 },
          ]}
        >
          {keyboardVisible ? 'Type your ID below:' : 'Enter your ID:'}
        </Text>
        <TextInput
          style={[styles.idInput, inputError ? { borderColor: 'red', borderWidth: 1 } : {}]}
          value={userId}
          onChangeText={(text) => {
            const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
            setUserId(alphanumericText);
            if (inputError) {
              setInputError(null);
            }
          }}
          placeholder="Your ID number"
          keyboardType="default"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        {inputError && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
            {inputError}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.idSubmitButton,
            { backgroundColor: '#FFFFFF' },
            isProcessing && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          <Text style={[styles.idSubmitButtonText, { color: '#000000' }]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.idCancelButton]}
          onPress={() => {
            onCancel();
            setUserId('');
            Keyboard.dismiss();
          }}
        >
          <Text style={styles.idCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
