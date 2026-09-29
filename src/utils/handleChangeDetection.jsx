export const handleChangeDetection = (
    formikValues,
    initialValues,
    setIsEdited
  ) => {
    const isDifferent = Object.keys(initialValues).some((key) => {
      const formikValue = formikValues[key];
      const initialValue = initialValues[key];
  
      // Skip undefined values safely
      if (formikValue == null && initialValue == null) return false;
  
      // Handle Date comparison
      const isDateLike = (val) =>
        val instanceof Date ||
        (typeof val === "string" && !isNaN(Date.parse(val)));
      if (["InsuranceMonth", "dimensions"].includes(key)) return false;
      if (isDateLike(formikValue) || isDateLike(initialValue)) {
        const parseSafeDate = (val) => {
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d.toISOString();
        };
  
        const date1 = parseSafeDate(formikValue);
        const date2 = parseSafeDate(initialValue);
  
        return date1 !== date2;
      }
  
      // Handle object with value property (e.g., selects)
      if (typeof formikValue === "object" && typeof initialValue === "object") {
        if (formikValue?.value !== initialValue?.value) {
          return true;
        }
      } else {
        if (formikValue !== initialValue) {
          return true;
        }
      }
  
      return false;
    });
  
    setIsEdited(isDifferent);
  };
  