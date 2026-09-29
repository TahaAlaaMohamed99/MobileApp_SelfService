import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      if (isMounted) {
        setIsOnline(state.isConnected ?? true);
      }
    });

    NetInfo.fetch().then(state => {
      if (isMounted) {
        setIsOnline(state.isConnected ?? true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline };
}
