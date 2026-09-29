const checkIsEdited = (formikRefs) => {
  const refs = Array.isArray(formikRefs) ? formikRefs : [formikRefs];

  return refs.some((formikRef) => {
    const formikValues = formikRef?.current?.values;
    const initialValues = formikRef?.current?.initialValues;

    if (!formikValues || !initialValues) return false;

    return Object.keys(initialValues).some((key) => {
      const formikValue = formikValues[key];
      const initialValue = initialValues[key];

      if (formikValue == null && initialValue == null) return false;

      if (['InsuranceMonth', 'dimensions'].includes(key)) return false;

      const isDateLike = (val) =>
        val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)));

      if (isDateLike(formikValue) || isDateLike(initialValue)) {
        const parseSafeDate = (val) => {
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d.toISOString();
        };

        return parseSafeDate(formikValue) !== parseSafeDate(initialValue);
      }

      if (typeof formikValue === 'object' && formikValue !== null && typeof initialValue === 'object' && initialValue !== null) {
        return formikValue?.value !== initialValue?.value;
      }

      return formikValue !== initialValue;
    });
  });
};

export default checkIsEdited;
