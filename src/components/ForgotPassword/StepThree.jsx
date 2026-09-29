import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';
import CustomInput from '../Form/CustomInput';
import CustomeBtn from '../CustomeBtn';
import { StepThreeForgotPasswordSchema } from '../../utils/validationSchema';

const ResourcePage = 'registration';

export default function StepThree({ isLoadingSubmit, handleSubmit }) {
  const { spacing, stylesText } = useDesignSystem();

  return (
    <View>
      <View style={{ marginBottom: spacing.xxl }}>
        <TranslationText
          page={ResourcePage}
          title="setNewPassword"
          style={[stylesText({ color: 'title', size: 'xxl', weight: 'semiBold' }), { marginBottom: spacing.xs }]}
        />
        <TranslationText
          page={ResourcePage}
          title="passwordMinLength"
          style={[stylesText({ color: 'text', size: 'md', weight: 'medium' })]}
        />
      </View>
      <Formik
        validationSchema={StepThreeForgotPasswordSchema}
        initialValues={{ newPassword: '', confirmPassword: '' }}
        enableReinitialize
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <CustomInput
              label="newPassword"
              type="password"
              placeholder="enterNewPassword"
              ResourcePage={ResourcePage}
              value={values.newPassword}
              Required={true}
              isWhite={true}
              errors={errors.newPassword}
              touched={touched.newPassword}
              onChange={handleChange('newPassword')}
              onBlur={handleBlur('newPassword')}
              name="newPassword_MegaHr"
            />
            <CustomInput
              label="confirmPassword"
              type="password"
              placeholder="enterConfirmPassword"
              ResourcePage={ResourcePage}
              value={values.confirmPassword}
              Required={true}
              isWhite={true}
              errors={errors.confirmPassword}
              touched={touched.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              name="confirmPassword_MegaHr"
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
