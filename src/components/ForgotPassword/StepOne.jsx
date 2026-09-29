import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';
import CustomInput from '../Form/CustomInput';
import CustomeBtn from '../CustomeBtn';
import { StepOneForgotPasswordSchema } from '../../utils/validationSchema';

const ResourcePage = 'registration';

export default function StepOne({ isLoadingSubmit, handleSubmitStepOne }) {
  const { spacing, stylesText } = useDesignSystem();

  return (
    <View>
      <View style={{ marginBottom: spacing.xxl }}>
        <TranslationText
          page={ResourcePage}
          title="forgotPassword"
          style={[stylesText({ color: 'title', size: 'xxl', weight: 'semiBold' }), { marginBottom: spacing.xs }]}
        />
        <TranslationText
          page={ResourcePage}
          title="resetInstructions"
          style={[stylesText({ color: 'text', size: 'md', weight: 'medium' })]}
        />
      </View>
      <Formik
        validationSchema={StepOneForgotPasswordSchema}
        initialValues={{ email: '' }}
        enableReinitialize
        onSubmit={(values) => handleSubmitStepOne(values, false)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <CustomInput
              label="email"
              type="email"
              placeholder="enterEmail"
              ResourcePage={ResourcePage}
              Required={true}
              isWhite={true}
              value={values.email}
              errors={errors.email}
              touched={touched.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              name="email_MegaHr"
            />
            <CustomeBtn
              isLoading={isLoadingSubmit}
              title="resetPassword"
              ResourcePage={ResourcePage}
              style={{ marginTop: spacing.xl }}
              type="primary"
              size="btn_lg"
              onPress={handleSubmit}
            />
          </>
        )}
      </Formik>
    </View>
  );
}
