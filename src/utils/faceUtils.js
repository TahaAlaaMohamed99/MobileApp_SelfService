import FaceDetection from '@react-native-ml-kit/face-detection';

export function isFaceValid(faceLike, minNormalized, minPixels = 20) {
  if (!faceLike) return false;
  const usedMinNormalized = typeof minNormalized === 'number' ? minNormalized : undefined;
  let w;
  let h;
  if (faceLike.bounds && typeof faceLike.bounds === 'object') {
    w = faceLike.bounds.width;
    h = faceLike.bounds.height;
  } else if (typeof faceLike.width === 'number' && typeof faceLike.height === 'number') {
    w = faceLike.width;
    h = faceLike.height;
  }
  if (typeof w !== 'number' || typeof h !== 'number') return false;
  if (w > 1 || h > 1) {
    return Math.max(w, h) >= minPixels;
  }
  if (typeof usedMinNormalized === 'number') {
    return Math.max(w, h) >= usedMinNormalized;
  }
  return Math.max(w, h) >= 0.05;
}

export async function verifyCapturedImageHasFace(imageUri, minFaceSize = 0.1) {
  try {
    const faces = await FaceDetection.detect(imageUri, {
      performanceMode: 'accurate',
      landmarkMode: 'none',
      contourMode: 'none',
      classificationMode: 'none',
      minFaceSize: minFaceSize,
      trackingEnabled: false,
    });

    if (!faces || faces.length === 0) {
      return {
        success: false,
        error: 'No face detected in captured image',
        faceCount: 0,
      };
    }

    const validFaces = faces.filter((face) => {
      if (!face.frame) return false;
      const faceWidth = face.frame.width;
      const faceHeight = face.frame.height;
      return faceWidth > 80 && faceHeight > 80;
    });

    if (validFaces.length === 0) {
      return {
        success: false,
        error: 'Face detected but too small or invalid',
        faceCount: faces.length,
      };
    }

    return {
      success: true,
      faces: validFaces,
      faceCount: validFaces.length,
    };
  } catch (error) {
    console.error('ML Kit face verification error:', error);
    return {
      success: false,
      error: `Face verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      faceCount: 0,
    };
  }
}
