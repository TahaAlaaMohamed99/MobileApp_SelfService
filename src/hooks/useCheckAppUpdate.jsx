import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

export function useCheckAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  const appVersion = Constants.expoConfig?.version;

  useEffect(() => {
    if (!API_URL || !appVersion) return;

    const checkUpdate = async () => {
      try {
        const response = await fetch(`${API_URL}/Auth/LastVersion`);
        const data = await response.json();
         if (data?.number && compareVersions(appVersion, data.number) < 0) {
          setUpdateAvailable(true);
          setLatestVersion(data);
        }
      } catch (error) {

      }
    };

    checkUpdate();
  }, []);

  const compareVersions = (current, latest) => {
    const curr = current.split('.').map(Number);
    const newVer = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(curr.length, newVer.length); i++) {
      const c = curr[i] || 0;
      const n = newVer[i] || 0;
      if (c < n) return -1;
      if (c > n) return 1;
    }
    return 0;
  };

  return { updateAvailable, latestVersion };
}
