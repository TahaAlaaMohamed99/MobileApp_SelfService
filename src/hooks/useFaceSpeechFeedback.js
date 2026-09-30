import {
  SPEECH_FAILURE,
  SPEECH_LANGUAGE,
  SPEECH_PITCH,
  SPEECH_RATE,
  SPEECH_SUCCESS_WITH_NAME,
  SPEECH_SUCCESS_WITHOUT_NAME,
} from '../utils/faceEnv';
import * as Speech from 'expo-speech';
import { useCallback } from 'react';

export function useFaceSpeechFeedback() {
  const speakFeedback = useCallback(async (success, userName = '') => {
    try {
      Speech.stop();

      const options = {
        language: SPEECH_LANGUAGE,
        pitch: SPEECH_PITCH,
        rate: SPEECH_RATE,
      };

      if (success) {
        const message = userName
          ? SPEECH_SUCCESS_WITH_NAME.replace('{name}', userName)
          : SPEECH_SUCCESS_WITHOUT_NAME;

        await Speech.speak(message, options);
      } else {
        await Speech.speak(SPEECH_FAILURE, options);
      }
    } catch {
      // Speech errors are ignored
    }
  }, []);

  return { speakFeedback };
}
