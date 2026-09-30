import { testApiConnection } from '../utils/faceApiTests';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useFaceApiAvailability() {
  const [apiAvailable, setApiAvailable] = useState(true);
  const [apiError, setApiError] = useState(undefined);
  const lastCheckTime = useRef(0);
  const lastCheckResult = useRef(true);
  const isCheckingRef = useRef(false);
  const apiStateRef = useRef({
    available: true,
    lastChecked: 0,
  });

  const checkApiAvailability = useCallback(async () => {
    if (isCheckingRef.current) {
      return lastCheckResult.current;
    }

    const now = Date.now();
    const minCheckInterval = 3000;
    if (now - lastCheckTime.current < minCheckInterval) {
      return lastCheckResult.current;
    }

    try {
      isCheckingRef.current = true;
      lastCheckTime.current = now;
      apiStateRef.current.lastChecked = now;

      const API_ENDPOINT = (await import('../utils/faceEnv')).API_ENDPOINT;
      const urlParts = API_ENDPOINT.split('/');
      const baseUrl = urlParts.slice(0, 3).join('/');
      const healthEndpoint = `${baseUrl}/health`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          apiStateRef.current.errorType = 'timeout';
          apiStateRef.current.errorMessage = 'Health endpoint request timed out';
        }, 3000);

        const healthResponse = await fetch(healthEndpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        clearTimeout(timeoutId);
        apiStateRef.current.statusCode = healthResponse.status;

        if (healthResponse.ok) {
          await healthResponse.json();
          setApiAvailable(true);
          setApiError(undefined);
          lastCheckResult.current = true;
          apiStateRef.current = {
            available: true,
            lastChecked: now,
            statusCode: healthResponse.status,
            errorType: undefined,
            errorMessage: undefined,
          };
          return true;
        } else {
          apiStateRef.current.errorType = 'server';
          apiStateRef.current.errorMessage = `Health endpoint returned status ${healthResponse.status}`;
        }
      } catch (healthError) {
        if (healthError instanceof TypeError && healthError.message.includes('Network')) {
          apiStateRef.current.errorType = 'network';
          apiStateRef.current.errorMessage = 'Network error connecting to health endpoint';
        } else if (healthError instanceof DOMException && healthError.name === 'AbortError') {
          apiStateRef.current.errorType = 'timeout';
          apiStateRef.current.errorMessage = 'Health endpoint request timed out';
        } else {
          apiStateRef.current.errorType = 'unknown';
          apiStateRef.current.errorMessage = healthError instanceof Error ? healthError.message : 'Unknown error';
        }
      }

      const result = await testApiConnection();
      setApiAvailable(result.isAvailable);
      lastCheckResult.current = result.isAvailable;

      apiStateRef.current = {
        available: result.isAvailable,
        lastChecked: now,
        errorType: result.isAvailable ? undefined : apiStateRef.current.errorType || 'unknown',
        errorMessage: result.isAvailable ? undefined : result.details,
      };

      if (!result.isAvailable) {
        setApiError(result.details);
      } else {
        setApiError(undefined);
      }

      return result.isAvailable;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API check error';
      apiStateRef.current = {
        available: false,
        lastChecked: now,
        errorType: 'unknown',
        errorMessage: errorMessage,
      };

      setApiAvailable(false);
      setApiError(errorMessage);
      lastCheckResult.current = false;
      return false;
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    lastCheckTime.current = 0;
    checkApiAvailability();

    const interval = setInterval(() => {
      checkApiAvailability();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkApiAvailability]);

  return {
    apiAvailable,
    setApiAvailable,
    checkApiAvailability,
    apiError,
    getApiState: () => apiStateRef.current,
  };
}
