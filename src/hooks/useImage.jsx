import { useCallback } from 'react';
import { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export const useImage = (image) => {
  const [uri, setUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!image) {
        setUri(null);
        return;
      }

      SecureStore.getItemAsync('apiUrl').then((apiUrl) => {
        if (isMounted) setUri(apiUrl ? `${apiUrl}${image}` : null);
      });

      return () => {
        isMounted = false;
      };
    }, [image])
  );

  return uri;
};

export default useImage;
