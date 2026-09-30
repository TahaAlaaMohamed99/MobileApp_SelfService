import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { useRunOnJS } from 'react-native-worklets-core';
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
    throttleFrameProcessor = false,
    throttleMs = 100,
  } = props;

  const device = useCameraDevice(props.cameraPosition);
  const cameraRef = useRef(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    if (pauseFaceDetection) {
      setDetectedFaces([]);
      facesDetectedRef.current = false;
      noFacesFrameCountRef.current = 0;
    }
  }, [pauseFaceDetection]);

  const faceDetector = useFaceDetector({
    performanceMode: 'accurate',
    landmarkMode: 'none',
    contourMode: 'all',
    classificationMode: 'all',
    minFaceSize: 0.08,
    trackingEnabled: false,
  });

  const resetCamera = () => {
    setCameraReady(false);
    setCameraError(null);
    setCameraKey((k) => k + 1);
  };

  const facesDetectedRef = useRef(false);
  const noFacesFrameCountRef = useRef(0);
  const frameCountThreshold = 2;

  const updateDetectedFaces = useRunOnJS((faces) => setDetectedFaces(faces), []);
  const handleFacesDetected = useRunOnJS(
    (faces) => {
      if (onFacesDetected) onFacesDetected(faces);
    },
    [onFacesDetected]
  );

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      try {
        if (pauseFaceDetection) {
          return;
        }

        if (throttleFrameProcessor) {
          global.__faceNotifyTs = global.__faceNotifyTs || 0;
          const nowTs = Date.now();
          if (nowTs - global.__faceNotifyTs < (throttleMs || 100)) {
            return;
          }
          global.__faceNotifyTs = nowTs;
        }

        if (!frame || frame.width === 0 || frame.height === 0) {
          if (facesDetectedRef.current) {
            noFacesFrameCountRef.current++;
            if (noFacesFrameCountRef.current >= frameCountThreshold) {
              facesDetectedRef.current = false;
              updateDetectedFaces([]);
              handleFacesDetected([]);
              noFacesFrameCountRef.current = 0;
            }
          }
          return;
        }

        const scannedFaces = faceDetector.detectFaces(frame);

        if (scannedFaces && scannedFaces.length > 0) {
          const validFaces = scannedFaces.filter(
            (face) =>
              face.bounds &&
              (face.bounds.width > 6 || face.bounds.height > 6) &&
              face.bounds.x >= 0 &&
              face.bounds.y >= 0
          );

          if (validFaces.length === 0) {
            noFacesFrameCountRef.current++;
            if (facesDetectedRef.current && noFacesFrameCountRef.current >= frameCountThreshold) {
              facesDetectedRef.current = false;
              updateDetectedFaces([]);
              handleFacesDetected([]);
              noFacesFrameCountRef.current = 0;
            }
            return;
          }

          noFacesFrameCountRef.current = 0;
          facesDetectedRef.current = true;

          const sortedFaces = [...validFaces].sort(
            (a, b) => b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height
          );

          const frameW = frame.width;
          const frameH = frame.height;

          const normalizedFaces = sortedFaces.map((face) => {
            const b = face.bounds;
            return {
              bounds: {
                x: b.x / frameW,
                y: b.y / frameH,
                width: b.width / frameW,
                height: b.height / frameH,
              },
            };
          });

          handleFacesDetected(normalizedFaces);
          updateDetectedFaces(normalizedFaces);
        } else {
          noFacesFrameCountRef.current++;
          if (facesDetectedRef.current && noFacesFrameCountRef.current >= frameCountThreshold) {
            facesDetectedRef.current = false;
            updateDetectedFaces([]);
            handleFacesDetected([]);
            noFacesFrameCountRef.current = 0;
          }
        }
      } catch {
        updateDetectedFaces([]);
        handleFacesDetected([]);
      }
    },
    [handleFacesDetected, updateDetectedFaces, throttleFrameProcessor, throttleMs, pauseFaceDetection]
  );

  useImperativeHandle(ref, () => ({
    takePicture: async () => {
      if (!cameraRef.current) {
        throw new Error('Camera reference not available');
      }

      const tryTakePhoto = async (attempt, maxAttempts) => {
        try {
          if (!device || !hasPermission) {
            throw new Error('Camera not ready - no device or permission');
          }
          if (!cameraReady) {
            throw new Error('Camera not initialized');
          }
          if (cameraError) {
            throw new Error(`Camera error: ${cameraError}`);
          }

          const delayTime = 150 + (attempt - 1) * 100;
          await new Promise((resolve) => setTimeout(resolve, delayTime));

          if (!cameraRef.current) {
            throw new Error('Camera reference not available after delay');
          }

          const photo = await cameraRef.current.takePhoto({
            flash: 'off',
          });
          return { uri: `file://${photo.path}` };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const isCameraSubmitError = errorMessage.includes('Failed to submit capture request');

          if (isCameraSubmitError && attempt < maxAttempts) {
            resetCamera();
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

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
      if (detectedFaces.length > 0) {
        const face = detectedFaces[0].bounds;
        if (
          face &&
          typeof face.x === 'number' &&
          typeof face.y === 'number' &&
          typeof face.width === 'number' &&
          typeof face.height === 'number' &&
          face.width > 0 &&
          face.height > 0
        ) {
          return face;
        }
      }
      return null;
    },
  }));

  if (!device || !hasPermission) {
    return (
      <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Camera not available</Text>
        <Text style={{ marginTop: 10, fontSize: 12, color: 'white' }}>
          Device: {device ? 'Found' : 'Not Found'}, Permission:{' '}
          {hasPermission ? 'Granted' : 'Not Granted'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.camera}>
      <Camera
        key={cameraKey}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        onInitialized={() => {
          setCameraReady(true);
          setCameraError(null);
        }}
        onError={(error) => {
          console.error('Camera onError:', error);
          setCameraReady(false);
          setCameraError(`${error.code}: ${error.message}`);
          if (error.message?.includes('not ready') || error.message?.includes('Failed to submit')) {
            setTimeout(() => resetCamera(), 1000);
          }
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
