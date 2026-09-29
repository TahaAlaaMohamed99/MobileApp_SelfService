import { useEffect } from 'react';
import { handleChangeDetection } from '../utils/handleChangeDetection';

export default function FormChangeTracker({ values, initialValues, id, setIsEdited }) {
  useEffect(() => {
    if (id > 0 && setIsEdited) {
      handleChangeDetection(values, initialValues, setIsEdited);
    }
  }, [values, initialValues, id, setIsEdited]);

  return null;
}
