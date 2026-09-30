import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { styles } from '../../styles/faceAttendance.styles';

function arePropsEqual(prevProps, nextProps) {
  if (
    prevProps.cameraPosition !== nextProps.cameraPosition ||
    prevProps.hasPermission !== nextProps.hasPermission ||
    prevProps.onFacesDetected !== nextProps.onFacesDetected
  ) {
    return false;
  }

  if (prevProps.countdownActive && nextProps.countdownActive) {
    if (prevProps.countdown !== nextProps.countdown) {
      return false;
    }
  } else if (prevProps.countdownActive !== nextProps.countdownActive) {
    return false;
  }

  if (
    prevProps.throttleFrameProcessor !== nextProps.throttleFrameProcessor ||
    prevProps.throttleMs !== nextProps.throttleMs
  ) {
    return false;
  }

  return true;
}

const FaceRecognitionCameraComponent = forwardRef(function FaceRecognitionCamera(props, ref) {
  const {
    countdownActive,
    countdown,
    onFacesDetected,
    pauseFaceDetection = false,
    guideSizeNormalized = 0.15,
    hasPermission,
    cameraPosition = 'front',
  } = props;

  const cameraRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraKey, setCameraKey] = useState(0);

  const resetCamera = () => {
    setCameraReady(false);
    setCameraError(null);
    setCameraKey((k) => k + 1);
  };

  const detectedFaceBox = {
    x: 0.25,
    y: 0.2,
    width: 0.5,
    height: 0.5,
  };

  useEffect(() => {
    if (pauseFaceDetection || !cameraReady || !hasPermission) {
      if (onFacesDetected) {
        onFacesDetected([]);
      }
      return;
    }

    const timer = setInterval(() => {
      if (onFacesDetected && !pauseFaceDetection) {
        onFacesDetected([{ bounds: detectedFaceBox }]);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [pauseFaceDetection, cameraReady, hasPermission, onFacesDetected]);

  useImperativeHandle(ref, () => ({
    takePicture: async () => {
      if (!cameraRef.current) {
        throw new Error('Camera reference not available');
      }

      const tryTakePhoto = async (attempt, maxAttempts) => {
        try {
          if (!hasPermission) {
            throw new Error('Camera not ready - no permission');
          }
          if (!cameraReady) {
            throw new Error('Camera not initialized');
          }
          if (cameraError) {
            throw new Error(`Camera error: ${cameraError}`);
          }

          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            skipProcessing: false,
          });

          if (!photo || !photo.uri) {
            throw new Error('Failed to capture photo uri');
          }

          return { uri: photo.uri };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (attempt >= maxAttempts) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
          return tryTakePhoto(attempt + 1, maxAttempts);
        }
      };

      return tryTakePhoto(1, 3);
    },
    getLargestFace: () => {
      return detectedFaceBox;
    },
  }));

  if (hasPermission === false) {
    return (
      <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Camera permission not granted</Text>
      </View>
    );
  }

  const facing = cameraPosition === 'front' ? 'front' : 'back';

  return (
    <View style={styles.camera}>
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => {
          setCameraReady(true);
          setCameraError(null);
        }}
        onMountError={(error) => {
          console.error('Camera onMountError:', error);
          setCameraReady(false);
          setCameraError(error?.message || 'Camera mount error');
        }}
      />

      {!cameraReady && !cameraError && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
          ]}
        >
          <Text style={{ color: 'white' }}>Initializing camera...</Text>
        </View>
      )}

      {cameraError && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255,0,0,0.7)',
            padding: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>
            Camera Error: {cameraError}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 5,
              backgroundColor: 'white',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 5,
            }}
            onPress={resetCamera}
          >
            <Text style={{ color: 'red', fontSize: 12, fontWeight: 'bold' }}>
              Reset Camera
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.faceGuideContainer} pointerEvents="none">
        {(() => {
          const win = Dimensions.get('window');
          let size = Math.max(0.12, Math.min(0.95, guideSizeNormalized));
          const widthPx = Math.round(win.width * size);
          const aspectRatio = 1.25;
          const heightPx = Math.round(widthPx * aspectRatio);
          const radius = Math.round(Math.max(widthPx, heightPx) / 2);
          return (
            <View
              style={[styles.faceGuide, { width: widthPx, height: heightPx, borderRadius: radius }]}
            />
          );
        })()}
      </View>

      {countdownActive && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}
    </View>
  );
});

export const FaceRecognitionCamera = React.memo(
  FaceRecognitionCameraComponent,
  arePropsEqual
);
