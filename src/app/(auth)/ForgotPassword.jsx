import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { getApi } from '../../services/Api';
import useToast from '../../hooks/useToast';
import { LogoName, IconBack } from '../../assets/IconsSvg';
import TranslationText from '../../components/TranslationText';
import StepOne from '../../components/ForgotPassword/StepOne';
import StepTwo from '../../components/ForgotPassword/StepTwo';
import StepThree from '../../components/ForgotPassword/StepThree';

const ResourcePage = 'registration';

export default function ForgotPassword() {
  const { spacing, wp, colors, stylesText, rowDirection, iconSize } = useDesignSystem();
  const toast = useToast();
  const apiInstance = getApi();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmitStepOne = (values, resend, setTimeLeft, setIsLoading = setIsLoadingSubmit) => {
    setIsLoading(true);
    apiInstance
      .post('User/SendResetOtp', { email: values.email })
      .then(async () => {
        toast.success('otpSentSuccessfully', null, ResourcePage);
        if (!resend) {
          setEmail(values.email);
          setStep(2);
        } else {
          setTimeLeft(300);
        }
        await AsyncStorage.setItem('forgotPasswordOtpTimer', JSON.stringify({ time: Date.now() }));
      })
      .catch((err) => {
        toast.error(err?.message || 'codeFailed', null, ResourcePage);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmitStepTwo = (values) => {
    setIsLoadingSubmit(true);
    apiInstance
      .post('User/ConfirmEmail', { email, otp: values.otp })
      .then(async (res) => {
        const resetToken = res?.data?.resetToken;
        await SecureStore.setItemAsync('resetToken', resetToken || '');
        toast.success('otpconfirmSuccess', null, ResourcePage);
        setStep(3);
      })
      .catch((err) => {
        toast.error(err?.message || 'confirmError', null, ResourcePage);
      })
      .finally(() => setIsLoadingSubmit(false));
  };

  const handleSubmitStepThree = async (values) => {
    setIsLoadingSubmit(true);
    const resetToken = await SecureStore.getItemAsync('resetToken');
    apiInstance
      .post('User/ForgetPassword', {
        email,
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      .then(() => {
        toast.success('passwordChangedSuccessfully', null, ResourcePage);
        router.replace('/(auth)/login');
      })
      .catch(() => {
        toast.error('failedToChangePassword', null, ResourcePage);
      })
      .finally(() => setIsLoadingSubmit(false));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'start', flexGrow: 1, backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: spacing.xxl }}>
          <LogoName width={wp(58)} height={wp(16)} colors={{ dark: colors.title, primary: colors.primary }} />
        </View>

        {step === 1 ? (
          <StepOne isLoadingSubmit={isLoadingSubmit} handleSubmitStepOne={handleSubmitStepOne} />
        ) : step === 2 ? (
          <StepTwo
            isLoadingSubmit={isLoadingSubmit}
            email={email}
            handleSubmit={handleSubmitStepTwo}
            handleSubmitResendEmail={(setTimeLeft, setIsLoadingTimeLeft) => handleSubmitStepOne({ email }, true, setTimeLeft, setIsLoadingTimeLeft)}
          />
        ) : (
          <StepThree isLoadingSubmit={isLoadingSubmit} handleSubmit={handleSubmitStepThree} />
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.xxl, alignSelf: 'center' }}
        >
          <IconBack color={colors.text} size={iconSize.md} />
          <TranslationText page={ResourcePage} title="backToLogin" style={[stylesText({ color: 'text', size: 'md', weight: 'medium' })]} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
