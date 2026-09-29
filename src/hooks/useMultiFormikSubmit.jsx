import { useCallback } from 'react';

export default function useMultiFormikSubmit(formikRefs = []) {
  const validateAllForms = useCallback(async () => {
    const forms = formikRefs.map((ref) => ref?.current).filter(Boolean);

    let hasErrors = false;
    const values = {};

    for (const formik of forms) {
      const errors = await formik.validateForm();

      formik.setTouched(
        Object.keys(formik.values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
        true,
      );

      Object.assign(values, formik.values);

      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      }
    }

    return {
      isValid: !hasErrors,
      values,
    };
  }, [formikRefs]);

  const execute = useCallback(
    async (callback) => {
      const { isValid, values } = await validateAllForms();

      if (!isValid) {
        return false;
      }

      return callback(values);
    },
    [validateAllForms],
  );

  return {
    execute,
  };
}
