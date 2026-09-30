import { Alert } from 'react-native';
import { API_ENDPOINT, CAPTURE_INTERVAL } from './faceEnv';

export const fetchWithTimeout = async (
  url,
  options = {},
  timeoutMs = CAPTURE_INTERVAL / 12
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const testApiConnection = async () => {
  const apiUrl = API_ENDPOINT;
  let result = {
    isAvailable: false,
    status: 'Unknown',
    details: 'No tests run yet',
  };

  try {
    const urlParts = apiUrl.split('/');
    const baseUrl = urlParts.slice(0, 3).join('/');
    const healthUrl = `${baseUrl}/health`;
    const startTime = Date.now();

    try {
      const healthResponse = await fetchWithTimeout(
        healthUrl,
        { method: 'GET', headers: { Accept: 'application/json' } },
        CAPTURE_INTERVAL / 12
      );
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        result.isAvailable = true;
        result.status = 'FastAPI server is healthy';
        result.details = `Health: ${healthData.status}, Threshold: ${healthData.threshold}, DB: ${healthData.db || 'unknown'}`;
        return result;
      }
    } catch (error) {
      logNetworkError('HEALTH_CHECK', error, {
        apiEndpoint: healthUrl,
        startTime,
        elapsedTime: Date.now() - startTime,
        method: 'GET',
      });
    }

    try {
      const baseResponse = await fetchWithTimeout(
        baseUrl,
        { method: 'GET' },
        CAPTURE_INTERVAL / 12
      );

      if (baseResponse.status === 404 || baseResponse.ok) {
        result.details = `FastAPI server responded with status ${baseResponse.status}`;
        result.isAvailable = true;
        result.status = 'FastAPI server is reachable';
        return result;
      }
    } catch (error) {
      logNetworkError('BASE_URL_CHECK', error, {
        apiEndpoint: baseUrl,
        startTime,
        elapsedTime: Date.now() - startTime,
        method: 'GET',
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.details = `Server connection failed: ${errorMessage}`;
      result.status = 'Server unreachable';
      result.isAvailable = false;
      return result;
    }

    try {
      const apiResponse = await fetchWithTimeout(
        apiUrl,
        { method: 'OPTIONS' },
        CAPTURE_INTERVAL / 12
      );

      const corsHeaders = apiResponse.headers.get('access-control-allow-origin');
      if (corsHeaders) {
        result.details = `API endpoint exists and CORS is configured (${corsHeaders})`;
        result.status = 'API endpoint is CORS-enabled';
        result.isAvailable = true;
      } else {
        result.details = 'API endpoint exists but may have CORS issues';
        result.status = 'Check CORS configuration';
        result.isAvailable = true;
      }
    } catch (error) {
      logNetworkError('API_OPTIONS_CHECK', error, {
        apiEndpoint: apiUrl,
        startTime,
        elapsedTime: Date.now() - startTime,
        method: 'OPTIONS',
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.details = `API endpoint test failed: ${errorMessage}`;
      result.status = 'Endpoint test failed';
      result.isAvailable = false;
    }

    return result;
  } catch (error) {
    logNetworkError('API_TEST_CRITICAL', error, {
      apiEndpoint: apiUrl,
      startTime: Date.now(),
      elapsedTime: 'N/A',
      method: 'GENERAL',
    });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      isAvailable: false,
      status: 'Test error',
      details: `Error during testing: ${errorMessage}`,
    };
  }
};

export const showApiTroubleshootingInfo = () => {
  Alert.alert(
    'FastAPI Troubleshooting',
    `Current endpoint: ${API_ENDPOINT}\n\n` +
      `Common issues:\n\n` +
      `1. FastAPI server not running\n` +
      `   - Check if uvicorn attendance_api.main:app is running\n` +
      `   - Command: uvicorn attendance_api.main:app --host 0.0.0.0 --port 8000 --reload\n\n` +
      `2. IP address is incorrect\n` +
      `   - Check server IP with ipconfig\n\n` +
      `3. Network issues\n` +
      `   - Ensure both devices on same network\n` +
      `   - Check firewall settings\n\n` +
      `To update API endpoint, modify src/utils/faceEnv.js`
  );
};

export const runAndDisplayApiDiagnostics = async () => {
  try {
    const results = await testApiConnection();

    Alert.alert(
      'FastAPI Diagnostics',
      `Status: ${results.status}\n\n` +
        `Details: ${results.details}\n\n` +
        `Connection: ${results.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}\n\n` +
        `Endpoint: ${API_ENDPOINT}`,
      [
        { text: 'View Troubleshooting Tips', onPress: showApiTroubleshootingInfo },
        { text: 'Test Connection', onPress: () => testNetworkConnection() },
        { text: 'OK' },
      ]
    );

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Alert.alert('Diagnostics Failed', `Unable to run diagnostics: ${errorMessage}`);
    return {
      isAvailable: false,
      status: 'Diagnostics failed',
      details: errorMessage,
    };
  }
};

export const logNetworkError = (prefix, error, contextInfo) => {
  const errorType = error?.constructor?.name || 'Unknown Type';
  const errorName = error instanceof Error ? error.name : 'Unnamed';
  const errorMessage = error instanceof Error ? error.message : 'No message';
  const errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack' : 'No stack';
  const timestamp = new Date().toISOString();
  return { errorType, errorName, errorMessage, errorStack, timestamp };
};

export const testNetworkConnection = async (customEndpoint) => {
  try {
    const apiUrl = customEndpoint || API_ENDPOINT;

    const googleDnsPromise = fetchWithTimeout('https://8.8.8.8', { method: 'HEAD' }, CAPTURE_INTERVAL / 30)
      .then(() => ({ success: true, status: 200, error: null }))
      .catch((error) => ({ success: false, status: 0, error: error instanceof Error ? error.message : 'Unknown error' }));

    const googleApiPromise = fetchWithTimeout('https://www.google.com/generate_204', { method: 'HEAD' }, CAPTURE_INTERVAL / 30)
      .then((response) => ({ success: response.ok, status: response.status, error: null }))
      .catch((error) => ({ success: false, status: 0, error: error instanceof Error ? error.message : 'Unknown error' }));

    const urlParts = apiUrl.split('/');
    const baseUrl = urlParts.slice(0, 3).join('/');
    const apiHost = urlParts[2];

    const serverHostPromise = fetchWithTimeout(baseUrl, { method: 'HEAD', headers: { Accept: 'text/html' } }, CAPTURE_INTERVAL / 20)
      .then((response) => ({ success: true, status: response.status, error: null }))
      .catch((error) => ({ success: false, status: 0, error: error instanceof Error ? error.message : 'Unknown error' }));

    const apiOptionsPromise = fetchWithTimeout(apiUrl, { method: 'OPTIONS', headers: { Accept: 'application/json' } }, CAPTURE_INTERVAL / 20)
      .then((response) => ({ success: response.ok, status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()), error: null }))
      .catch((error) => ({ success: false, status: 0, statusText: '', headers: {}, error: error instanceof Error ? error.message : 'Unknown error' }));

    const healthUrl = `${baseUrl}/health`;
    const healthCheckPromise = fetchWithTimeout(healthUrl, { method: 'GET', headers: { Accept: 'application/json' } }, CAPTURE_INTERVAL / 20)
      .then(async (response) => {
        let healthData = null;
        if (response.ok) {
          try { healthData = await response.json(); } catch {}
        }
        return { success: response.ok, status: response.status, data: healthData, error: null };
      })
      .catch((error) => ({ success: false, status: 0, data: null, error: error instanceof Error ? error.message : 'Unknown error' }));

    const [googleDns, googleApi, serverHost, apiOptions, healthCheck] = await Promise.all([
      googleDnsPromise, googleApiPromise, serverHostPromise, apiOptionsPromise, healthCheckPromise,
    ]);

    let diagnosis = '';
    let detailedReport = '';

    if (!googleApi.success && !googleDns.success) {
      diagnosis = 'No internet connection. Check WiFi/data.';
      detailedReport = 'Internet: ❌ Disconnected\nDNS: ❌ Issues\nIssue: Device has no working internet connection';
    } else if (!serverHost.success) {
      diagnosis = 'Internet works but API server unreachable. Check if server is running or IP is correct.';
      detailedReport = `Internet: ✅ Connected\nAPI Host (${apiHost}): ❌ Unreachable\nError: ${serverHost.error}`;
    } else if (!apiOptions.success) {
      diagnosis = 'API server is reachable but API endpoint has issues.';
      detailedReport = `Server Host: ✅ Reachable\nAPI Endpoint: ❌ Status ${apiOptions.status}`;
    } else {
      diagnosis = 'Network connection to API seems good.';
      detailedReport = 'Internet: ✅ Connected\nAPI Host: ✅ Reachable\nAPI Endpoint: ✅ Accessible';
    }

    const results = {
      googleDns, googleApi, serverHost, apiOptions, healthCheck,
      apiUrl, apiHost, diagnosis, detailedReport, success: apiOptions.success,
    };

    Alert.alert(
      'Network Connectivity',
      `Internet: ${googleApi.success ? '✅ Connected' : '❌ Disconnected'}\n\n` +
        `API Host: ${serverHost.success ? '✅ Reachable' : '❌ Unreachable'}\n\n` +
        `API Endpoint: ${apiOptions.success ? '✅ OK' : `❌ Status ${apiOptions.status}`}\n\n` +
        `Diagnosis: ${diagnosis}`,
      [
        { text: 'View Details', onPress: () => Alert.alert('Detailed Report', detailedReport) },
        { text: 'OK' },
      ]
    );

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Alert.alert('Connection Test Failed', `Could not complete network tests: ${errorMessage}`);
    return {
      apiUrl: customEndpoint || API_ENDPOINT,
      apiHost: 'unreachable',
      diagnosis: 'Connection test failed',
      detailedReport: errorMessage,
      success: false,
    };
  }
};
