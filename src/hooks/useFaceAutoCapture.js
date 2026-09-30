import { useCallback, useEffect, useRef, useState } from 'react';
import { CAPTURE_INTERVAL } from '../utils/faceEnv';

export function useFaceAutoCapture({
  isEnabled,
  captureInterval = CAPTURE_INTERVAL,
  isProcessing,
  lastRecognizedTime,
  cooldownTime,
  onCapture,
  isBlocked = false,
}) {
  const [isActive, setIsActive] = useState(isEnabled);
  const [nextCaptureTime, setNextCaptureTime] = useState(0);
  const captureTimerRef = useRef(null);
  const lastCaptureAttemptRef = useRef(0);
  const minCaptureInterval = CAPTURE_INTERVAL / 2;
  const lastScheduleLogRef = useRef(0);

  const startAutoCapture = useCallback(() => {
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    const now = Date.now();
    let timeToNextCapture;

    if (
      lastRecognizedTimeRef.current > 0 &&
      now - lastRecognizedTimeRef.current < cooldownTimeRef.current
    ) {
      timeToNextCapture = Math.max(
        0,
        lastRecognizedTimeRef.current + cooldownTimeRef.current - now
      );
      lastScheduleLogRef.current = now;
    } else {
      timeToNextCapture = captureIntervalRef.current;
      lastScheduleLogRef.current = now;
    }

    const nextCaptureTimeValue = now + timeToNextCapture;
    nextCaptureTimeRef.current = nextCaptureTimeValue;

    setTimeout(() => {
      setNextCaptureTime(nextCaptureTimeValue);
    }, 0);

    const handleCapture = () => {
      const currentTime = Date.now();
      const timeSinceLastCapture = currentTime - lastCaptureAttemptRef.current;

      if (timeSinceLastCapture < minCaptureInterval) {
        const waitTime = Math.max(minCaptureInterval - timeSinceLastCapture, 5000);
        captureTimerRef.current = setTimeout(() => {
          if (!isProcessingRef.current && !isBlockedRef.current) {
            lastCaptureAttemptRef.current = Date.now();
            onCaptureRef.current();
          }
          setTimeout(() => {
            startAutoCapture();
          }, 0);
        }, waitTime);
        return;
      }

      if (!isProcessingRef.current && !isBlockedRef.current) {
        lastCaptureAttemptRef.current = currentTime;
        onCaptureRef.current();
      }

      setTimeout(() => {
        if (isActiveRef.current) {
          startAutoCapture();
        }
      }, 100);
    };

    captureTimerRef.current = setTimeout(handleCapture, timeToNextCapture);
  }, [minCaptureInterval]);

  const toggleAutoCapture = useCallback(() => {
    setIsActive((prev) => {
      if (!prev) {
        setTimeout(() => {
          if (!isProcessingRef.current && !isBlockedRef.current) {
            onCaptureRef.current();
            lastCaptureAttemptRef.current = Date.now();
            setTimeout(() => {
              startAutoCaptureRef.current();
            }, 0);
          }
        }, 0);
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (isEnabled && !isProcessing && !isBlocked) {
      setTimeout(() => {
        onCapture();
        lastCaptureAttemptRef.current = Date.now();
      }, 1000);
    }
  }, []);

  const isActiveRef = useRef(isActive);
  const isProcessingRef = useRef(isProcessing);
  const isBlockedRef = useRef(isBlocked);
  const lastRecognizedTimeRef = useRef(lastRecognizedTime);
  const cooldownTimeRef = useRef(cooldownTime);
  const captureIntervalRef = useRef(captureInterval);
  const onCaptureRef = useRef(onCapture);
  const nextCaptureTimeRef = useRef(nextCaptureTime);

  useEffect(() => {
    isActiveRef.current = isActive;
    isProcessingRef.current = isProcessing;
    isBlockedRef.current = isBlocked;
    lastRecognizedTimeRef.current = lastRecognizedTime;
    cooldownTimeRef.current = cooldownTime;
    captureIntervalRef.current = captureInterval;
    onCaptureRef.current = onCapture;
    nextCaptureTimeRef.current = nextCaptureTime;
  }, [
    isActive,
    isProcessing,
    isBlocked,
    lastRecognizedTime,
    cooldownTime,
    captureInterval,
    onCapture,
    nextCaptureTime,
  ]);

  const startAutoCaptureRef = useRef(startAutoCapture);
  useEffect(() => {
    startAutoCaptureRef.current = startAutoCapture;
  }, [startAutoCapture]);

  useEffect(() => {
    function checkAndStartTimer() {
      if (isActiveRef.current && !isProcessingRef.current && !isBlockedRef.current) {
        setTimeout(() => {
          startAutoCaptureRef.current();
        }, 0);
      }
    }

    const checkInterval = setInterval(() => {
      if (
        isActiveRef.current &&
        !isProcessingRef.current &&
        !isBlockedRef.current &&
        !captureTimerRef.current
      ) {
        checkAndStartTimer();
      } else if ((!isActiveRef.current || isBlockedRef.current) && captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
    }, 1000);

    checkAndStartTimer();

    return () => {
      clearInterval(checkInterval);
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isActive !== isEnabled) {
      setIsActive(isEnabled);
    }
  }, [isEnabled, isActive]);

  return {
    isActive,
    toggleAutoCapture,
    nextCaptureTime,
  };
}
