import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';

import { ApiConnectionError } from '../../../../components/FaceRecognition/ApiConnectionError';
import { FaceRecognitionCamera } from '../../../../components/FaceRecognition/FaceRecognitionCamera';
import { IdInputForm } from '../../../../components/FaceRecognition/IdInputForm';
import { ErrorMessage, SuccessMessage } from '../../../../components/FaceRecognition/Messages';
import { ProcessingOverlay } from '../../../../components/FaceRecognition/ProcessingOverlay';
import { StatusComponent } from '../../../../components/FaceRecognition/StatusComponent';

import { useFaceApiAvailability } from '../../../../hooks/useFaceApiAvailability';
import { useFaceAutoCapture } from '../../../../hooks/useFaceAutoCapture';
import { useFaceSpeechFeedback } from '../../../../hooks/useFaceSpeechFeedback';

import { styles } from '../../../../styles/faceAttendance.styles';
import { isFaceValid as utilIsFaceValid } from '../../../../utils/faceUtils';
import {
  API_ENDPOINT as apiEndpoint,
  CAPTURE_INTERVAL,
  ERROR_COOLDOWN,
  ERROR_RESET_TIME,
  ID_INPUT_TIMEOUT,
  RECOGNITION_COOLDOWN as recognitionCooldown,
} from '../../../../utils/faceEnv';

const GUIDE_SIZE_NORMALIZED = 0.6;
const detectionMinNormalized = Math.max(0.04, GUIDE_SIZE_NORMALIZED * 0.35);

const FACE_PROC_THROTTLE = true;
const FACE_PROC_THROTTLE_MS = 100;
const FACE_PROC_THROTTLE_MS_COUNTDOWN = 150;

function formatTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function FaceRecognitionScreen() {
  const [cameraPosition] = useState('front');
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  const [showIdInput, setShowIdInput] = useState(false);
  const idInputTimeoutRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [lastRecognizedTime, setLastRecognizedTime] = useState(0);

  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownTimerRef = useRef(null);

  const verifyingRef = useRef(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const setVerifying = useCallback((flag) => {
    verifyingRef.current = flag;
    setIsVerifying(flag);
  }, []);

  const captureTokenRef = useRef(null);
  const lastCapturedPhotoRef = useRef(null);
  const showIdDeferredRef = useRef(false);
  const manualIdBlockRef = useRef(0);

  const [successMessage, setSuccessMessage] = useState({
    visible: false,
    userName: '',
    userId: '',
    time: '',
    sentToOdoo: false,
    imageUri: undefined,
  });

  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    reason: '',
    time: '',
  });

  const insets = useSafeAreaInsets();
  const autoEnabled = true;
  const [detectedFaces, setDetectedFaces] = useState([]);
  const lastFrameFaceRef = useRef(null);

  const isFaceValid = useCallback((faceLike, minNormalized, minPixels = 20) => {
    return utilIsFaceValid(
      faceLike,
      typeof minNormalized === 'number' ? minNormalized : detectionMinNormalized,
      minPixels
    );
  }, []);

  const { apiAvailable, checkApiAvailability, setApiAvailable, apiError, getApiState } =
    useFaceApiAvailability();
  const { speakFeedback } = useFaceSpeechFeedback();

  useFaceAutoCapture({
    isEnabled: autoEnabled,
    captureInterval: CAPTURE_INTERVAL,
    isProcessing,
    lastRecognizedTime,
    cooldownTime: recognitionCooldown,
    isBlocked: showIdInput || inCooldown,
    onCapture: async () => {
      if (detectedFaces.length === 0) {
        return;
      }
      if (!apiAvailable) {
        return;
      }
      if (!isProcessing && !countdownActive && !showIdInput) {
        startCountdownProcess();
      }
    },
  });

  const handleApiError = useCallback(
    async (response, manualId) => {
      let title = 'API Error';
      let errorMessage = 'Failed to recognize user. Please try again.';
      let troubleshootingSteps = '';

      switch (response.status) {
        case 400:
          title = 'Bad Request';
          errorMessage = 'The server could not process your request. The image may be invalid.';
          troubleshootingSteps =
            '• Try again with clearer lighting\n• Position your face more centered in the frame';
          break;
        case 401:
          title = 'Authentication Error';
          errorMessage = 'Your session may have expired or authentication is required.';
          troubleshootingSteps =
            '• Log out and log back in\n• Check credentials if using manual ID';
          break;
        case 403:
          title = 'Permission Denied';
          errorMessage = 'You do not have permission to access this resource.';
          troubleshootingSteps =
            '• Contact your administrator for access\n• Verify your permissions are set correctly';
          break;
        case 404:
          title = 'API Endpoint Not Found';
          errorMessage = 'The recognition service endpoint could not be found.';
          troubleshootingSteps =
            '• Check server configuration\n• Verify API endpoint URL is correct';
          break;
        case 405:
          title = 'Method Not Allowed';
          errorMessage = 'The server is not configured to accept image uploads.';
          troubleshootingSteps = '• Contact your IT department\n• Check server API configuration';
          break;
        case 408:
          title = 'Request Timeout';
          errorMessage = 'The server took too long to process your request.';
          troubleshootingSteps =
            '• Check network speed\n• Server might be overloaded\n• Try again later';
          break;
        case 413:
          title = 'Image Too Large';
          errorMessage = 'The captured image is too large for the server to process.';
          troubleshootingSteps =
            '• App needs to be updated to compress images\n• Contact your administrator';
          break;
        case 500:
          title = 'Server Error';
          errorMessage = 'The recognition server encountered an internal error.';
          troubleshootingSteps =
            '• Contact your administrator\n• Check server logs\n• Wait a few minutes and try again';
          break;
        case 502:
        case 503:
        case 504:
          title = 'Service Unavailable';
          errorMessage = 'The recognition service is currently unavailable.';
          troubleshootingSteps =
            '• Server might be down or restarting\n• Network gateway issues\n• Try again in a few minutes';
          setApiAvailable(false);
          break;
      }

      try {
        const errorData = await response.json();
        if (errorData) {
          if (errorData.message) errorMessage = errorData.message;
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') errorMessage = errorData.detail;
            else if (Array.isArray(errorData.detail)) errorMessage = errorData.detail.map((err) => err.msg).join('\n');
          }
        }
      } catch {}

      speakFeedback(false);

      if (!showIdInput && !manualId) {
        if (isProcessingRef.current) {
          showIdDeferredRef.current = true;
        } else {
          setShowIdInput(true);
        }
      }

      if (manualId || response.status >= 500) {
        Alert.alert(
          title,
          errorMessage + (troubleshootingSteps ? '\n\nTroubleshooting:\n' + troubleshootingSteps : ''),
          [{ text: 'OK' }]
        );
      } else {
        setErrorMessage({
          visible: true,
          reason: errorMessage,
          time: formatTime(new Date()),
        });
        setTimeout(() => {
          setErrorMessage((prev) => ({ ...prev, visible: false }));
        }, 5000);
      }
    },
    [showIdInput, speakFeedback, setApiAvailable]
  );

  const lastErrorShownRef = useRef(0);
  const errorCountRef = useRef(0);

  const handleNetworkError = useCallback(
    (error) => {
      const now = Date.now();
      errorCountRef.current++;
      setTimeout(() => errorCountRef.current--, ERROR_RESET_TIME);

      if (now - lastErrorShownRef.current < ERROR_COOLDOWN || errorCountRef.current > 3) {
        return;
      }

      lastErrorShownRef.current = now;

      let errorMessage = 'An error occurred while processing attendance.';
      let errorDetails = '';

      if (error instanceof Error && error.message === 'API server is unavailable') {
        setApiAvailable(false);
        return;
      } else if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage = 'Network connection error.';
        errorDetails =
          '1. FastAPI/uvicorn server is running\n' +
          '2. IP address is correct: ' +
          apiEndpoint.split('/')[2] +
          '\n3. Device and server are on same network';
      } else if (error instanceof Error && error.message === 'Request timed out') {
        errorMessage = 'FastAPI request timed out.';
      } else if (error instanceof Error && error.message.includes('JSON')) {
        errorMessage = 'Invalid response from server.';
      } else if (error instanceof Error && error.message.includes('Failed to submit capture request')) {
        errorMessage = 'Failed to submit image to server.';
      } else if (error instanceof Error) {
        errorMessage = 'Connection Error: ' + error.message;
      }

      speakFeedback(false);

      Alert.alert('Connection Error', errorMessage + (errorDetails ? '\n\nPlease check:\n\n' + errorDetails : ''), [
        { text: 'Retry Connection', onPress: () => checkApiAvailability() },
        { text: 'OK' },
      ]);
    },
    [speakFeedback, setApiAvailable, checkApiAvailability]
  );

  const faceClearTimeoutRef = useRef(null);
  const lastFacesStateRef = useRef(false);
  const hadNoFacesRef = useRef(true);

  const clearFaceTimeouts = useCallback(() => {
    if (faceClearTimeoutRef.current) {
      clearTimeout(faceClearTimeoutRef.current);
      faceClearTimeoutRef.current = null;
    }
  }, []);

  const scheduleFaceClear = useCallback((delayMs, shouldCancelCountdown = false) => {
    clearFaceTimeouts();
    faceClearTimeoutRef.current = setTimeout(() => {
      setDetectedFaces([]);
      lastFacesStateRef.current = false;
      hadNoFacesRef.current = true;

      if (shouldCancelCountdown && countdownActive) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdownActive(false);
        setCountdown(3);
      }

      if (captureTokenRef.current) {
        captureTokenRef.current = null;
      }

      faceClearTimeoutRef.current = null;
    }, delayMs);
  }, [clearFaceTimeouts, countdownActive]);

  const updateCooldownStatus = useCallback(
    (source) => {
      const now = Date.now();
      const isCoolingDown =
        lastRecognizedTime > 0 && now - lastRecognizedTime < recognitionCooldown;

      if (isCoolingDown) {
        const remaining = Math.max(0, lastRecognizedTime + recognitionCooldown - now);
        setInCooldown(true);
        setCooldownRemaining(remaining);
        return { active: true, remaining };
      } else {
        setInCooldown(false);
        setCooldownRemaining(0);
        return { active: false, remaining: 0 };
      }
    },
    [lastRecognizedTime]
  );

  const postCooldownHoldRef = useRef(0);

  const captureAndSendImage = useCallback(
    async (tokenOrManualId) => {
      let finalResponse = null;
      let token = null;
      let manualId = undefined;
      if (typeof tokenOrManualId === 'string') {
        if (tokenOrManualId.startsWith('manual:')) {
          manualId = tokenOrManualId.slice('manual:'.length);
        } else if (/^\d+$/.test(tokenOrManualId)) {
          token = tokenOrManualId;
        } else {
          manualId = tokenOrManualId;
        }
      }
      let shouldShowIdAfterProcessing = false;
      setDetectedFaces([]);

      if (!cameraRef.current) {
        setVerifying(false);
        return;
      }

      if (token) {
        if (!captureTokenRef.current || captureTokenRef.current !== token) {
          setVerifying(false);
          return;
        }
      }

      try {
        if (!manualId) {
          const largestFace = cameraRef.current.getLargestFace
            ? cameraRef.current.getLargestFace()
            : null;
          if (!isFaceValid(largestFace, detectionMinNormalized)) {
            setVerifying(false);
            return;
          }
        }

        let photo = null;
        if (manualId) {
          if (lastCapturedPhotoRef.current && lastCapturedPhotoRef.current.uri) {
            photo = lastCapturedPhotoRef.current;
          } else {
            photo = await cameraRef.current.takePicture();
          }
        } else {
          photo = await cameraRef.current.takePicture();
          try {
            lastCapturedPhotoRef.current = photo;
          } catch {}
        }

        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdownActive(false);
        setCountdown(3);

        try {
          const { verifyCapturedImageHasFace } = await import('../../../../utils/faceUtils');
          const verificationResult = await verifyCapturedImageHasFace(photo.uri, 0.08);

          if (!verificationResult.success) {
            manualIdBlockRef.current = Date.now() + 2000;
            setVerifying(false);
            speakFeedback(false);

            const errorMsg = verificationResult.error || 'No face detected in captured image';
            setErrorMessage({
              visible: true,
              reason: `Capture failed: ${errorMsg}. Please ensure your face is clearly visible.`,
              time: formatTime(new Date()),
            });
            setTimeout(() => setErrorMessage((prev) => ({ ...prev, visible: false })), 3500);

            try {
              setDetectedFaces([]);
              lastFrameFaceRef.current = null;
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
              }
              setCountdownActive(false);
              setCountdown(3);
              hadNoFacesRef.current = true;
              postCooldownHoldRef.current = Date.now() + 1000;
            } catch {}

            if (captureTokenRef.current && token) captureTokenRef.current = null;
            return;
          }
        } catch {
          manualIdBlockRef.current = Date.now() + 2000;
          setVerifying(false);
          speakFeedback(false);

          setErrorMessage({
            visible: true,
            reason: 'Face verification failed. Please try again.',
            time: formatTime(new Date()),
          });
          setTimeout(() => setErrorMessage((prev) => ({ ...prev, visible: false })), 2500);

          try {
            setDetectedFaces([]);
            lastFrameFaceRef.current = null;
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setCountdownActive(false);
            setCountdown(3);
            hadNoFacesRef.current = true;
            postCooldownHoldRef.current = Date.now() + 1000;
          } catch {}

          if (captureTokenRef.current && token) captureTokenRef.current = null;
          return;
        }

        setVerifying(false);
        if (token && (!captureTokenRef.current || captureTokenRef.current !== token)) {
          return;
        }

        setIsProcessing(true);
        isProcessingRef.current = true;
        if (!manualId) {
          setLastRecognizedTime(Date.now());
          updateCooldownStatus('CAPTURE_START');
        }

        const formData = new FormData();
        const imageFile = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        };
        formData.append('image', imageFile);
        if (manualId) formData.append('s_identification_id', manualId);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        if (!apiAvailable && !manualId) {
          const isApiAvailable = await checkApiAvailability();
          if (!isApiAvailable) throw new Error('API server is unavailable');
        }

        const fetchPromise = fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }).catch((err) => {
          throw new Error(
            `Failed to submit capture request to ${apiEndpoint}: ${err?.message || err}`
          );
        });

        finalResponse = await Promise.race([fetchPromise, timeoutPromise]);
        const response = finalResponse;

        if (response.ok) {
          try {
            const data = await response.json();
            if (data.matched && data.user) {
              const userName = data.user.name || '';
              const userId = data.user.s_identification_id || '';
              speakFeedback(true, userName);
              setLastRecognizedTime(Date.now());
              setInCooldown(true);
              setCooldownRemaining(recognitionCooldown);
              updateCooldownStatus('USER_RECOGNIZED');
              setShowIdInput(false);
              setSuccessMessage({
                visible: true,
                userName,
                userId,
                time: formatTime(new Date()),
                sentToOdoo: data.sent_odoo,
                imageUri: photo?.uri,
              });
              setTimeout(
                () =>
                  setSuccessMessage((prev) => ({
                    ...prev,
                    visible: false,
                    imageUri: undefined,
                  })),
                5000
              );
            } else {
              speakFeedback(false);
              const failureReason = data.reason || 'No match found';
              let displayReason = failureReason;
              if (failureReason === 'no face detected')
                displayReason = 'Server could not detect a face in the image.';
              else if (failureReason === 'no user matches')
                displayReason = 'Face not recognized. Please position your face clearly or enter your ID.';
              else if (failureReason.includes('not found'))
                displayReason = 'User ID not found. Please verify your ID.';
              setErrorMessage({
                visible: true,
                reason: displayReason,
                time: formatTime(new Date()),
              });
              setTimeout(() => setErrorMessage((prev) => ({ ...prev, visible: false })), 5000);
              if (!manualId) updateCooldownStatus('NO_MATCH_COOLDOWN');
              if (!showIdInput && !manualId) {
                shouldShowIdAfterProcessing = true;
              }
            }

            try {
              setDetectedFaces([]);
              lastFrameFaceRef.current = null;
              postCooldownHoldRef.current = Date.now() + 1000;
              setInCooldown(true);
            } catch {}
          } catch (err) {
            throw new Error('Invalid JSON response from server');
          }
        } else {
          handleApiError(response, manualId);
        }
      } catch (error) {
        if (!manualId) updateCooldownStatus('CAPTURE_ERROR');
        handleNetworkError(error);
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
        if (shouldShowIdAfterProcessing) setShowIdInput(true);
        if (showIdDeferredRef.current) {
          setShowIdInput(true);
          showIdDeferredRef.current = false;
        }
        if (!manualId) updateCooldownStatus('PROCESSING_COMPLETE');
        try {
          if (manualId && lastCapturedPhotoRef.current && finalResponse && finalResponse.ok) {
            lastCapturedPhotoRef.current = null;
          }
        } catch {}
      }
    },
    [
      speakFeedback,
      showIdInput,
      handleApiError,
      handleNetworkError,
      apiAvailable,
      checkApiAvailability,
      updateCooldownStatus,
      isFaceValid,
      setVerifying,
    ]
  );

  const startCountdownProcess = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (postCooldownHoldRef.current && Date.now() < postCooldownHoldRef.current) {
      return;
    }
    if (isVerifying) return;

    if (detectedFaces.length === 0 || !lastFrameFaceRef.current) {
      return;
    }

    const largestFace = lastFrameFaceRef.current;
    if (!isFaceValid(largestFace)) {
      return;
    }

    const lf = lastFrameFaceRef.current;
    if (lf && lf.bounds) {
      const cx = lf.bounds.x + lf.bounds.width / 2;
      const cy = lf.bounds.y + lf.bounds.height / 2;
      const centerThreshold = 0.2;
      const dx = Math.abs(cx - 0.5);
      const dy = Math.abs(cy - 0.5);
      const faceCentered = dx <= centerThreshold && dy <= centerThreshold;
      if (!faceCentered) {
        return;
      }
    }

    setCountdownActive(true);
    setCountdown(3);
    clearFaceTimeouts();

    const faceCheckInterval = setInterval(() => {
      let currentFace = lastFrameFaceRef.current;
      try {
        const live = cameraRef.current?.getLargestFace ? cameraRef.current.getLargestFace() : null;
        if (live) {
          currentFace = {
            bounds: {
              x: live.x,
              y: live.y,
              width: live.width,
              height: live.height,
            },
          };
        }
      } catch {}

      if (!isFaceValid(currentFace)) {
        clearInterval(faceCheckInterval);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        scheduleFaceClear(300, true);
        setCountdownActive(false);
        setCountdown(3);
      }
    }, 50);

    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          clearInterval(faceCheckInterval);
          let finalFaceCheck = lastFrameFaceRef.current;
          try {
            const live = cameraRef.current?.getLargestFace ? cameraRef.current.getLargestFace() : null;
            if (live) {
              finalFaceCheck = {
                bounds: {
                  x: live.x,
                  y: live.y,
                  width: live.width,
                  height: live.height,
                },
              };
            }
          } catch {}

          if (isFaceValid(finalFaceCheck)) {
            setCountdownActive(false);
            setVerifying(true);
            const token = String(Date.now());
            captureTokenRef.current = token;

            (async () => {
              const preCaptureTimeout = 300;
              const prePollInterval = 50;
              let confirmed = false;
              const startPre = Date.now();
              while (Date.now() - startPre < preCaptureTimeout) {
                if (!captureTokenRef.current || captureTokenRef.current !== token) {
                  confirmed = false;
                  break;
                }

                let currentFace = lastFrameFaceRef.current;
                try {
                  const live = cameraRef.current?.getLargestFace ? cameraRef.current.getLargestFace() : null;
                  if (live) {
                    currentFace = {
                      bounds: {
                        x: live.x,
                        y: live.y,
                        width: live.width,
                        height: live.height,
                      },
                    };
                  }
                } catch {}

                const nowTs = Date.now();
                const recentGuard = currentFace && (currentFace.ts ? nowTs - currentFace.ts <= 500 : true);
                if (currentFace && recentGuard && isFaceValid(currentFace, detectionMinNormalized)) {
                  confirmed = true;
                  break;
                }
                await new Promise((resolve) => setTimeout(resolve, prePollInterval));
              }

              if (confirmed) {
                captureAndSendImage(token);
              } else {
                setVerifying(false);
                captureTokenRef.current = null;
                speakFeedback(false);
                setErrorMessage({
                  visible: true,
                  reason: 'Face moved before capture. Please try again.',
                  time: formatTime(new Date()),
                });
                setTimeout(() => setErrorMessage((prev) => ({ ...prev, visible: false })), 2500);
              }
            })();
          } else {
            setCountdownActive(false);
            scheduleFaceClear(300, true);
          }
          return 3;
        }
        return prevCount - 1;
      });
    }, 1000);

    countdownTimerRef.current = timer;

    return () => {
      clearInterval(faceCheckInterval);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [captureAndSendImage, detectedFaces, isFaceValid, speakFeedback, setVerifying, isVerifying, clearFaceTimeouts, scheduleFaceClear]);

  const startCountdown = useCallback(async () => {
    if (isProcessing) return;
    if (apiAvailable) {
      startCountdownProcess();
      return;
    }
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      Alert.alert(
        'Server Unavailable',
        'Cannot connect to the server. Please check your network connection and try again.',
        [{ text: 'OK' }]
      );
    } else {
      startCountdownProcess();
    }
  }, [checkApiAvailability, isProcessing, startCountdownProcess, apiAvailable]);

  const handleIdSubmit = useCallback(
    (id) => {
      if (manualIdBlockRef.current && Date.now() < manualIdBlockRef.current) {
        setErrorMessage({ visible: true, reason: 'Cannot submit ID right now. Please try again.', time: formatTime(new Date()) });
        setTimeout(() => setErrorMessage((prev) => ({ ...prev, visible: false })), 2500);
        return;
      }

      if (!id.trim()) {
        Alert.alert('Error', 'Please enter your ID');
        return;
      }
      setShowIdInput(false);
      if (idInputTimeoutRef.current) {
        clearTimeout(idInputTimeoutRef.current);
        idInputTimeoutRef.current = null;
      }
      clearFaceTimeouts();
      captureAndSendImage(`manual:${id.trim()}`);
    },
    [captureAndSendImage, clearFaceTimeouts]
  );

  const handleFacesDetected = useCallback(
    (faces) => {
      const validFaces = faces.filter((face) =>
        isFaceValid(face, detectionMinNormalized)
      );
      const hasFaces = validFaces.length > 0;

      if (hasFaces) {
        lastFrameFaceRef.current = {
          ...validFaces[0],
          ts: Date.now(),
        };
        clearFaceTimeouts();
        setDetectedFaces(validFaces);
        lastFacesStateRef.current = true;
      } else {
        lastFrameFaceRef.current = null;
        scheduleFaceClear(1000, countdownActive);
      }
    },
    [countdownActive, isFaceValid, clearFaceTimeouts, scheduleFaceClear]
  );

  useEffect(() => {
    if (detectedFaces.length > 0 && hadNoFacesRef.current) {
      hadNoFacesRef.current = false;
      if (!isProcessing && !countdownActive && !showIdInput && !inCooldown && apiAvailable) {
        setTimeout(() => {
          if (
            detectedFaces.length > 0 &&
            !isProcessing &&
            !countdownActive &&
            !showIdInput &&
            !inCooldown
          ) {
            startCountdownProcess();
          }
        }, 300);
      }
    } else if (detectedFaces.length === 0) {
      hadNoFacesRef.current = true;
    }
  }, [
    detectedFaces,
    isProcessing,
    countdownActive,
    showIdInput,
    inCooldown,
    apiAvailable,
    startCountdownProcess,
  ]);

  const lastApiCheckTimeRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await checkApiAvailability();
      lastApiCheckTimeRef.current = Date.now();
    })();

    const apiCheckInterval = setInterval(async () => {
      await checkApiAvailability();
      lastApiCheckTimeRef.current = Date.now();
    }, 120000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      clearInterval(apiCheckInterval);
    };
  }, [checkApiAvailability]);

  const initialCaptureRef = useRef(false);
  useEffect(() => {
    if (
      detectedFaces.length > 0 &&
      !initialCaptureRef.current &&
      !isProcessing &&
      !countdownActive &&
      !showIdInput &&
      !inCooldown
    ) {
      const hasValidFace = detectedFaces.some(
        (face) => face.bounds && face.bounds.width > 0 && face.bounds.height > 0
      );

      if (hasValidFace) {
        initialCaptureRef.current = true;
        setTimeout(() => {
          if (apiAvailable && detectedFaces.length > 0 && !inCooldown) {
            startCountdownProcess();
          }
        }, 500);
      }
    }
  }, [
    detectedFaces,
    isProcessing,
    countdownActive,
    showIdInput,
    inCooldown,
    apiAvailable,
    startCountdownProcess,
  ]);

  useEffect(() => {
    if (showIdInput) {
      if (idInputTimeoutRef.current) {
        clearTimeout(idInputTimeoutRef.current);
      }

      idInputTimeoutRef.current = setTimeout(() => {
        setShowIdInput(false);
        updateCooldownStatus('ID_AUTO_HIDE');
      }, ID_INPUT_TIMEOUT);
    } else {
      setTimeout(() => {
        updateCooldownStatus('ID_HIDDEN');
      }, 100);
    }

    return () => {
      if (idInputTimeoutRef.current) {
        clearTimeout(idInputTimeoutRef.current);
      }
    };
  }, [showIdInput, updateCooldownStatus]);

  useEffect(() => {
    const shouldPause = isProcessing || showIdInput || inCooldown;
    if (shouldPause) {
      if (detectedFaces.length > 0) {
        setDetectedFaces([]);
        lastFrameFaceRef.current = null;
      }
      const pollInterval = setInterval(() => {
        if (detectedFaces.length > 0) {
          setDetectedFaces([]);
          lastFrameFaceRef.current = null;
        }
      }, 200);
      return () => clearInterval(pollInterval);
    }
  }, [isProcessing, showIdInput, inCooldown, detectedFaces.length]);

  const lastCooldownStateRef = useRef(inCooldown);

  useEffect(() => {
    updateCooldownStatus('INTERVAL_INIT');
    const intervalId = setInterval(() => {
      const status = updateCooldownStatus('INTERVAL');
      if (lastCooldownStateRef.current !== status.active) {
        const prev = lastCooldownStateRef.current;
        lastCooldownStateRef.current = status.active;
        if (prev === true && status.active === false) {
          clearFaceTimeouts();
          postCooldownHoldRef.current = Date.now() + 1000;
          hadNoFacesRef.current = true;
          lastFrameFaceRef.current = null;
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastRecognizedTime, inCooldown, showIdInput, updateCooldownStatus, clearFaceTimeouts]);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
        <Text style={{ color: 'white' }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
        <Text style={{ marginBottom: 20, color: 'white' }}>No access to camera</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={{ color: '#fff' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: '#000' }]}>
      {!apiAvailable && (
        <ApiConnectionError
          apiEndpoint={apiEndpoint}
          onRetry={checkApiAvailability}
          lastCheckTime={lastApiCheckTimeRef.current}
          errorDetails={apiError || getApiState().errorMessage}
        />
      )}

      <FaceRecognitionCamera
        ref={cameraRef}
        isProcessing={isProcessing}
        countdownActive={countdownActive}
        countdown={countdown}
        cameraPosition={cameraPosition}
        hasPermission={hasPermission}
        onFacesDetected={handleFacesDetected}
        pauseFaceDetection={isProcessing || showIdInput || inCooldown}
        guideSizeNormalized={0.6}
        throttleFrameProcessor={FACE_PROC_THROTTLE && !countdownActive && !isProcessing}
        throttleMs={countdownActive ? FACE_PROC_THROTTLE_MS_COUNTDOWN : FACE_PROC_THROTTLE_MS}
      />

      {successMessage.visible && (
        <SuccessMessage
          userName={successMessage.userName}
          userId={successMessage.userId}
          time={successMessage.time}
          sentToOdoo={successMessage.sentToOdoo}
          imageUri={successMessage.imageUri}
        />
      )}

      {errorMessage.visible && (
        <ErrorMessage reason={errorMessage.reason} time={errorMessage.time} />
      )}

      <IdInputForm
        visible={showIdInput}
        isProcessing={isProcessing}
        onSubmit={handleIdSubmit}
        onCancel={() => {
          setShowIdInput(false);
          clearFaceTimeouts();
          setDetectedFaces([]);
          updateCooldownStatus('ID_CANCEL');
        }}
      />

      <ProcessingOverlay isProcessing={isProcessing} />

      {!showIdInput &&
        (() => {
          const lastFace = lastFrameFaceRef.current;
          let faceCentered = false;
          if (lastFace && lastFace.bounds) {
            const cx = lastFace.bounds.x + lastFace.bounds.width / 2;
            const cy = lastFace.bounds.y + lastFace.bounds.height / 2;
            const centerThreshold = 0.2;
            const dx = Math.abs(cx - 0.5);
            const dy = Math.abs(cy - 0.5);
            faceCentered = dx <= centerThreshold && dy <= centerThreshold;
          }
          return (
            <StatusComponent
              isProcessing={isProcessing}
              countdownActive={countdownActive}
              onStartCountdown={startCountdown}
              faceDetected={detectedFaces.length > 0}
              inCooldown={inCooldown}
              cooldownRemaining={cooldownRemaining}
              faceCentered={faceCentered}
            />
          );
        })()}
    </View>
  );
}
