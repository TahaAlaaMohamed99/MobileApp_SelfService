import React, { useState } from 'react';
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runAndDisplayApiDiagnostics, testNetworkConnection } from '../../utils/faceApiTests';

export function ApiConnectionError({
  apiEndpoint,
  onRetry,
  lastCheckTime = Date.now(),
  errorDetails,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const insets = useSafeAreaInsets();
  const ipAndPort = apiEndpoint?.split('/').slice(2)[0] || 'unknown';
  const [testResult, setTestResult] = useState(null);

  const runQuickTest = async () => {
    setTestResult('Testing connection...');
    try {
      const result = await testNetworkConnection(apiEndpoint);
      setTestResult(result.detailedReport);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during test';
      setTestResult('Test failed: ' + errorMsg);
    }
    onRetry();
  };

  const openNetworkSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=WIFI');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        paddingTop: insets.top + 10,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#FF6666',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 5,
        }}
      >
        <Text
          style={{
            color: 'white',
            flex: 1,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          ⚠️ FastAPI Connection Error
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#333',
              padding: 8,
              borderRadius: 5,
              marginLeft: 10,
            }}
            onPress={onRetry}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#555',
              padding: 8,
              borderRadius: 5,
              marginLeft: 10,
            }}
            onPress={runAndDisplayApiDiagnostics}
          >
            <Text style={{ color: 'white' }}>Diagnose</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          color: 'white',
          fontSize: 13,
          marginBottom: 5,
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Cannot connect to server:</Text>{' '}
        {ipAndPort}
        {'\n'}
        Attendance records cannot be processed or saved.
        {'\n'}
        Last check: {new Date(lastCheckTime).toLocaleTimeString()}
      </Text>

      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: 8,
          borderRadius: 5,
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          Troubleshooting Steps:
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 12,
          }}
        >
          1. Verify server is running: uvicorn attendance_api.main:app --host 0.0.0.0 --port 8000
          {'\n'}
          2. Check network connection (same WiFi/network as server)
          {'\n'}
          3. Verify server IP address is correct: {ipAndPort}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 5,
              borderRadius: 5,
              flex: 1,
              marginRight: 5,
              alignItems: 'center',
            }}
            onPress={runQuickTest}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Quick Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#555',
              padding: 5,
              borderRadius: 5,
              flex: 1,
              marginLeft: 5,
              alignItems: 'center',
            }}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#555',
              padding: 5,
              borderRadius: 5,
              flex: 1,
              marginLeft: 5,
              alignItems: 'center',
            }}
            onPress={openNetworkSettings}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Network Settings</Text>
          </TouchableOpacity>
        </View>

        {showDetails && (
          <ScrollView
            style={{
              maxHeight: 100,
              backgroundColor: 'rgba(0,0,0,0.4)',
              marginTop: 8,
              padding: 5,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: '#FFD700', fontSize: 11 }}>
              {testResult || errorDetails || 'No additional error details available.'}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
