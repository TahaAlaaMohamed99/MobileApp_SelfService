import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { ScrollView } from 'react-native-gesture-handler';
import { LogoName } from '../../assets/IconsSvg';
import TranslationText from '../../components/TranslationText';
import CustomInput from '../../components/Form/CustomInput';
import { Formik } from "formik";
import { loginSchema } from '../../utils/validationSchema';
import CustomeBtn from '../../components/CustomeBtn';
import CustomCheckbox from '../../components/Form/CustomCheckbox';
import CustomOTPInput from '../../components/Form/CustomOTPInput';
import { decodeToken } from 'react-jwt'
import useToast from '../../hooks/useToast';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function login() {
    const { spacing, wp, stylesText, colors, rowDirection } = useDesignSystem();
    const toast = useToast();
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    const handleSubm = (values) => {
        setIsLoadingSubmit(true)
        const payload = {
            userName: values.userName,
            password: values.password,
            code: values.activationCode,
            rememberMe: values.rememberMe,
            UserType: 2,
        }

        const headers = { 'Content-Type': 'application/json', accept: '*/*' }

        axios.post(`${API_URL}/Auth/CompanyUrl`, payload, {
            headers: headers
        }).then((response) => {
            const { companyName, apiUrl } = response.data
            axios.post(`${apiUrl}/api/Authentication/login`, payload, {
                headers: headers
            }).then(async (res) => {
                const { token, refreshToken } = res.data
                const myDecodedToken = decodeToken(token);
                if (!myDecodedToken) {
                    toast.error('loginFailed', null, 'registration')
                    return
                }
                const userIdToken =
                    myDecodedToken[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                    ] || myDecodedToken["id"];

                const userName =
                    myDecodedToken[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                    ] || myDecodedToken["name"];
                const userPermissions =
                    myDecodedToken.Permissions?.split(",").map(Number);
                const dataUser = { userId: userIdToken, userName, companyName, ...myDecodedToken };
                await Promise.all([
                    SecureStore.setItemAsync('accessToken', token),
                    SecureStore.setItemAsync('refreshToken', refreshToken),
                    SecureStore.setItemAsync('apiUrl', apiUrl),
                    AsyncStorage.setItem('user', JSON.stringify(dataUser)),
                ]);
                toast.success('loginSuccess', null, 'GeneralMessages')
                router.replace('/(protected)/(tabs)/Dashboard')
                setIsLoadingSubmit(false)

            }).catch((error) => {
                const errorMassges = error?.response?.data || 'loginFailed'
                 toast.error(errorMassges[""]?.[0], null, 'GeneralMessages')
 
                setIsLoadingSubmit(false)
            })
        }).catch((error) => {
            const errorMassges = error?.response?.data || 'loginFailed'
            toast.error(errorMassges, null, 'GeneralMessages')
            setIsLoadingSubmit(false)
        })
    }
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
                contentContainerStyle={{ justifyContent: "center", alignItems: "start", flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ marginBottom: spacing.xxl }} >
                    <LogoName width={wp(58)} height={wp(16)}
                        colors={{ dark: colors.title, primary: colors.primary }}

                    />
                </View>
                <View style={{ marginBottom: spacing.xxl }}>
                    <TranslationText page="registration" title="logInToYourAccount" style={[stylesText({ color: "title", size: "xxl", weight: "semiBold" }), { marginBottom: spacing.xs }]} />
                    <TranslationText page="registration" title="welcomeBack" style={[stylesText({ color: "text", size: "md", weight: "medium" })]} />
                </View>
                <View>
                    <Formik
                        validationSchema={loginSchema}
                        initialValues={{ userName: "", password: "", activationCode: "", rememberMe: true }}
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
                                <CustomOTPInput
                                    label="activetionCode"
                                    type="text"
                                    ResourcePage="registration"
                                    Required={true}
                                    value={values.activationCode}
                                    errors={errors.activationCode}
                                    touched={touched.activationCode}
                                    onChange={handleChange("activationCode")}
                                    onBlur={handleBlur("activationCode")}
                                    name="activationCode_MegaHr"
                                />
                                <CustomInput
                                    label="userName"
                                    type="text"
                                    placeholder="enterUserName"
                                    ResourcePage="registration"
                                    Required={true}
                                    isWhite={true}
                                    value={values.userName}
                                    errors={errors.userName}
                                    touched={touched.userName}
                                    onChange={handleChange("userName")}
                                    onBlur={handleBlur("userName")}
                                    name="userName_MegaHr"
                                />
                                <CustomInput
                                    label="password"
                                    type="password"
                                    ResourcePage="registration"
                                    placeholder="enterPassword"
                                    value={values.password}
                                    Required={true}
                                    errors={errors.password}
                                    touched={touched.password}
                                    onChange={handleChange("password")}
                                    onBlur={handleBlur("password")}
                                    name="password_MegaHr"
                                    isWhite={true}

                                    className="form-group_icon"
                                />

                                <View style={{ flexDirection: rowDirection, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <CustomCheckbox
                                        label="rememberMe"
                                        value={values.rememberMe}
                                        onChange={() =>
                                            setFieldValue("rememberMe", !values.rememberMe)
                                        }
                                        isWhite={true}

                                        lang={true}
                                        ResourcePage={"registration"}
                                    />
                                    <TranslationText
                                        page="registration"
                                        title="forgotPassword"
                                        onPress={() => router.push('/(auth)/ForgotPassword')}
                                        style={stylesText({ color: "primary", size: "sm", weight: "semiBold" })}
                                    />
                                </View>
                                <CustomeBtn
                                    isLoading={isLoadingSubmit}
                                    title="signIn"
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