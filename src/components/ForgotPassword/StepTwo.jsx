import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';
import CustomOTPInput from '../Form/CustomOTPInput';
import CustomeBtn from '../CustomeBtn';
import { StepTwoForgotPasswordSchema } from '../../utils/validationSchema';

const ResourcePage = 'registration';
const OTP_EXPIRATION_TIME = 5 * 60; // 300 seconds
const OTP_STORAGE_KEY = 'forgotPasswordOtpTimer';

export default function StepTwo({ isLoadingSubmit, email, handleSubmit, handleSubmitResendEmail }) {
  const { spacing, colors, stylesText, rowDirection } = useDesignSystem();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoadingTimeLeft, setIsLoadingTimeLeft] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(OTP_STORAGE_KEY);
      if (!stored) {
        setTimeLeft(OTP_EXPIRATION_TIME);
        return;
      }
      try {
        const { time } = JSON.parse(stored);
        const elapsedSeconds = Math.floor((Date.now() - time) / 1000);
        const remainingSeconds = OTP_EXPIRATION_TIME - elapsedSeconds;
        setTimeLeft(Math.max(0, remainingSeconds));
      } catch {
        setTimeLeft(OTP_EXPIRATION_TIME);
      }
    })();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View>
      <View style={{ marginBottom: spacing.xxl }}>
        <TranslationText
          page={ResourcePage}
          title="passwordReset"
          style={[stylesText({ color: 'title', size: 'xxl', weight: 'semiBold' }), { marginBottom: spacing.xs }]}
        />
        <View style={{ flexDirection: rowDirection, flexWrap: 'wrap' }}>
          <TranslationText page={ResourcePage} title="sentCodeTo" style={[stylesText({ color: 'text', size: 'md', weight: 'medium' })]} />
          <Text style={[stylesText({ color: 'title', size: 'md', weight: 'semiBold' }), { paddingStart: spacing.xs }]}>{email}</Text>
        </View>
      </View>
      <Formik
        validationSchema={StepTwoForgotPasswordSchema}
        initialValues={{ otp: '' }}
        enableReinitialize
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <CustomOTPInput
              name="otp"
              length={6}
              Required
              ResourcePage={ResourcePage}
              value={values.otp}
              onChange={handleChange('otp')}
              onBlur={handleBlur('otp')}
              errors={errors.otp}
              touched={touched.otp}
            />
            <CustomeBtn
              isLoading={isLoadingSubmit}
              title="continue"
              style={{ marginTop: spacing.xl }}
              ResourcePage={ResourcePage}
              type="primary"
              size="btn_lg"
              onPress={handleSubmit}
            />
          </>
        )}
      </Formik>
      <View style={{ flexDirection: rowDirection, justifyContent: 'center', flexWrap: 'wrap', marginTop: spacing.xl }}>
        <TranslationText
          page={ResourcePage}
          title={timeLeft > 0 ? 'resendCodeIn' : 'didNotReceiveEmail'}
          style={[stylesText({ color: 'title', size: 'md', weight: 'medium' })]}
        />
        {timeLeft > 0 ? (
          <Text style={[stylesText({ color: 'primary', size: 'md', weight: 'bold' }), { paddingStart: spacing.xs }]}>
            {formatTime(timeLeft)}
          </Text>
        ) : (
          isLoadingTimeLeft ? (
            <View>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) :
            <TranslationText
              page={ResourcePage}
              title="clickToResend"
              onPress={() => handleSubmitResendEmail(setTimeLeft, setIsLoadingTimeLeft)}
              style={[stylesText({ color: 'primary', size: 'md', weight: 'medium' }), { paddingStart: spacing.xs }]}
            />
        )}
      </View>
    </View>
  );
}
