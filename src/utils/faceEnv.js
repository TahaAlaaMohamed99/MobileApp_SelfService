// API endpoint for attendance detection
export const API_ENDPOINT = 'http://172.16.105.189:8000/attendance/detect';

// Controls how often recognition and capture actions are allowed
export const RECOGNITION_COOLDOWN = 10000;
export const CAPTURE_INTERVAL = 10000;

// Error handling
export const ERROR_COOLDOWN = 10000;
export const ERROR_RESET_TIME = 30000;

// Speech feedback configuration
export const SPEECH_LANGUAGE = 'vi-VN';
export const SPEECH_PITCH = 1.0;
export const SPEECH_RATE = 0.9;

export const SPEECH_SUCCESS_WITH_NAME = 'Xin cảm ơn, {name}';
export const SPEECH_SUCCESS_WITHOUT_NAME = 'Xin cảm ơn';
export const SPEECH_FAILURE = 'Xin vui lòng thử lại';

export const ID_INPUT_TIMEOUT = 30000;
