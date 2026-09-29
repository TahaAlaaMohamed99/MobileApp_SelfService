import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import SectionContainer from './SectionContainer';
import CustomDatePicker from './Form/CustomDatePicker';
import CustomInput from './Form/CustomInput';
import FormChangeTracker from './FormChangeTracker';
import { useDesignSystem } from '../hooks/useDesignSystem';



function TransactionSection({
  isFromDate = false,
  isDisabled = true,
  extraExecutionOnchange,
  extraTransOnchange,
  isModal = false,
  isDescriptionRequired = false,
  formikRef,
  initialValues,
  id,
  validationSchema,
  transactionDatekey = "transDate",
  setIsEdited
}) {
  const { rowDirection, spacing } = useDesignSystem();
  return (
    <Formik
      innerRef={formikRef}
      validationSchema={isDescriptionRequired ? validationSchema : undefined}
      initialValues={initialValues}
      enableReinitialize={true}
    >
      {({ setFieldValue, setFieldTouched, values, errors, touched }) => (
        <>

          <FormChangeTracker
            values={values}
            initialValues={initialValues}
            id={id}
            setIsEdited={setIsEdited}
          />
          <SectionContainer isModal={isModal} ResourcePage="GeneralTransaction" title="TransactionDetails">
            <CustomInput
              label="code"
              Required
              placeholder="pleaseEnterCode"
              ResourcePage="GeneralField"
              disabled
              value={values?.code}
              onChange={(val) => setFieldValue('code', val)}
            />

            <View style={{ flexDirection: rowDirection, gap: spacing.sm }}>
              <CustomDatePicker
                label="executionDate"
                ResourcePage="GeneralTransaction"
                Required
                onChange={(date) => {
                  if (isFromDate) return;
                  setFieldValue('executionDate', date);
                  extraExecutionOnchange?.(date);
                }}
                value={values?.executionDate}
                disabled={isFromDate || isDisabled}
                style={{ flex: 1 }}
              />
              <CustomDatePicker
                label="transDate"
                ResourcePage="GeneralTransaction"
                Required
                onChange={(date) => {
                  setFieldValue(transactionDatekey, date);
                  extraTransOnchange?.(date);
                }}
                value={values?.[transactionDatekey]}
                disabled={isDisabled}
                style={{ flex: 1 }}
              />
            </View>

            <CustomInput
              label="description"
              placeholder="pleaseEnterDescription"
              ResourcePage="GeneralTransaction"
              Required={isDescriptionRequired}
              value={values?.name}
              onChange={(val) => setFieldValue('name', val)}
              name="description_MegaHr"
              disabled={isDisabled}
              onBlur={() => setFieldTouched('name', true)}
              errors={errors?.name}
              touched={touched?.name}
            />
          </SectionContainer>
        </>
      )}
    </Formik>
  );
}

export default TransactionSection;
