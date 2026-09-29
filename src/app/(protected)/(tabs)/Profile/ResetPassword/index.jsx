import { View, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import Constants from 'expo-constants'
import { useDesignSystem } from '../../../../../hooks/useDesignSystem';
import { ScrollView } from 'react-native-gesture-handler';
import TranslationText from '../../../../../components/TranslationText';
import CustomInput from '../../../../../components/Form/CustomInput';
import { Formik } from "formik";
import { ResetPassSchema } from '../../../../../utils/validationSchema';
import CustomeBtn from '../../../../../components/CustomeBtn';

import useToast from '../../../../../hooks/useToast';
import { useUserData } from '../../../../../hooks/useUserData';
import { getApi } from '../../../../../services/Api';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetPasswordEdit() {
  const { spacing, stylesText, colors, } = useDesignSystem();
  const { userId } = useUserData();
  const Api = getApi();

  const toast = useToast();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const handleSubm = async (values) => {
    setIsLoadingSubmit(true);
  
    try {
      const res = await Api.post(`User/ResetPassword`, {
        userId: userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
  
      const data = res.data;
  
      if (data?.success === true) {
        toast.success(
          "passwordChangedSuccessfully",
          null,
          "GeneralMessages"
        );
  
         await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await AsyncStorage.removeItem("user");
  
         router.replace("/(auth)/login");
  
        return;
      }
  
      toast.error(data?.messages?.message?.[0]);
  
    } catch (err) {
   {console.log(err); }
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={{ alignItems: "start", flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={{ marginBlock: spacing.xxl }}>
          <Formik
            validationSchema={ResetPassSchema}
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            enableReinitialize
            onSubmit={(values) => handleSubm(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <>
                <CustomInput
                  label="oldPassword"
                  type="password"
                  ResourcePage="registration"
                  placeholder="enterOldPassword"
                  value={values.oldPassword}
                  Required={true}
                  errors={errors.oldPassword}
                  touched={touched.oldPassword}
                  onChange={handleChange("oldPassword")}
                  onBlur={handleBlur("oldPassword")}
                  name="oldPassword_MegaHr"
                  isWhite={true}
                />

                <CustomInput
                  label="newPassword"
                  type="password"
                  ResourcePage="registration"
                  placeholder="enterNewPassword"
                  value={values.newPassword}
                  Required={true}
                  errors={errors.newPassword}
                  touched={touched.newPassword}
                  onChange={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  name="newPassword_MegaHr"
                  isWhite={true}
                />

                <CustomInput
                  label="confirmPassword"
                  type="password"
                  ResourcePage="registration"
                  placeholder="enterConfirmPassword"
                  value={values.confirmPassword}
                  Required={true}
                  errors={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  name="confirmPassword_MegaHr"
                  isWhite={true}
                />

                <CustomeBtn
                  isLoading={isLoadingSubmit}
                  title="resetPassword"
                  style={{ marginTop: spacing.xl }}
                  ResourcePage={"registration"}
                  type="primary"
                  size="btn_lg"
                  onPress={handleSubmit}
                />
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}