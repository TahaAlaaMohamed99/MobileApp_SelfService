import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useLayoutEffect } from "react";
import { I18nManager, useColorScheme } from "react-native";
import * as Localization from "expo-localization";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { store } from "../store";
import { setCurrentLanguage, setTheme } from "../store/themeSlice";
import { colors } from "../theme";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import ToastManager from "toastify-react-native";
import CustomToast from "../components/CustomToast";
import NoInternet from "../components/NoInternet";
import ErrorBottomSheet from "../components/Shared/ErrorBottomSheet";
import { useNetworkStatus } from "../hooks/useNetworkStatus.jsx";
import { useCheckAppUpdate } from "../hooks/useCheckAppUpdate";
import { useFetchTranslations } from "../hooks/useFetchTranslations";
import { UpdateApp } from "../components/UpdateApp.jsx";
import NotificationToast from '../components/NotificationToast.jsx';

SplashScreen.preventAutoHideAsync();

function AppInner() {
    const dispatch = useDispatch();
    const reduxTheme = useSelector((state) => state.themeSlice.theme);
    const currentLanguage = useSelector((state) => state.themeSlice.currentLanguage);
    const deviceScheme = useColorScheme();
    const { refetch: fetchTranslations } = useFetchTranslations();

    useLayoutEffect(() => {
        (async () => {
            const [savedTheme, savedLanguage] = await Promise.all([
                AsyncStorage.getItem("theme"),
                AsyncStorage.getItem("language"),
            ]);
            const resolvedLanguage = savedLanguage ?? (Localization.getLocales()[0]?.languageCode === "ar" ? "ar" : "en");
            dispatch(setTheme(savedTheme ?? deviceScheme));
            dispatch(setCurrentLanguage(resolvedLanguage));

            await fetchTranslations();

            const shouldBeRTL = resolvedLanguage === "ar";
            if (I18nManager.isRTL !== shouldBeRTL) {
                I18nManager.allowRTL(shouldBeRTL);
                I18nManager.forceRTL(shouldBeRTL);
                await Updates.reloadAsync();
            }
        })();
    }, []);



    const toastConfig = {
        success: (props) => <CustomToast {...props} />,
        error: (props) => <CustomToast {...props} />,
        warning: (props) => <CustomToast {...props} />,
        info: (props) => <CustomToast {...props} />,
        custom: (props) => <CustomToast {...props} />,
        notification: (props) => <NotificationToast {...props} />,
    };
    return (
        <>
            <ToastManager
                duration={4000}
                config={toastConfig}
                position="top"
            />

            <StatusBar style={reduxTheme == "dark" ? "light" : "dark"} />
        </>
    );
}

export default function RootLayout() {
    const { isOnline } = useNetworkStatus();
    const { updateAvailable, latestVersion } = useCheckAppUpdate();
    const [fontsLoaded, fontError] = useFonts({
        Cairo: require("../assets/fonts/Cairo/Cairo-Regular.ttf"),
        "Cairo-Medium": require("../assets/fonts/Cairo/Cairo-Medium.ttf"),
        "Cairo-SemiBold": require("../assets/fonts/Cairo/Cairo-SemiBold.ttf"),
        "Cairo-Bold": require("../assets/fonts/Cairo/Cairo-Bold.ttf"),
        Roboto: require("../assets/fonts/Roboto/Roboto-Regular.ttf"),
        "Roboto-Medium": require("../assets/fonts/Roboto/Roboto-Medium.ttf"),
        "Roboto-Bold": require("../assets/fonts/Roboto/Roboto-Bold.ttf"),
        "Roboto-SemiBold": require("../assets/fonts/Roboto/Roboto-SemiBold.ttf"),
        Californian: require("../assets/fonts/SignatureFonts/CalifornianSignature.otf"),
        Caveat: require("../assets/fonts/SignatureFonts/Caveat-VariableFont_wght.ttf"),
        Cintarini: require("../assets/fonts/SignatureFonts/Cintarini.ttf"),
        "Dalton White": require("../assets/fonts/SignatureFonts/DaltonWhite.otf"),
        DancingScript: require("../assets/fonts/SignatureFonts/DancingScript-VariableFont_wght.ttf"),
        "Eagle Horizon": require("../assets/fonts/SignatureFonts/EagleHorizonP.ttf"),
        Humble: require("../assets/fonts/SignatureFonts/HumbleSignation.ttf"),
        Signatie: require("../assets/fonts/SignatureFonts/Signatie.otf"),
        "Bastliga One": require("../assets/fonts/SignatureFonts/BastligaOne.ttf"),
        "Brittany Signature Script": require("../assets/fonts/SignatureFonts/BrittanySignatureScript.ttf"),
        Jalliya: require("../assets/fonts/SignatureFonts/Jalliya.otf"),
        Priestacy: require("../assets/fonts/SignatureFonts/Priestacy.otf"),
        Rapilot: require("../assets/fonts/SignatureFonts/Rapilot-Regular.otf"),
        Thesignature: require("../assets/fonts/SignatureFonts/Thesignature.otf"),
        "Arslan Wessam B": require("../assets/fonts/SignatureFonts/a-arslan-wessam-b.ttf"),
        "Leila Light": require("../assets/fonts/SignatureFonts/leila-light.ttf"),
        Sayeh: require("../assets/fonts/SignatureFonts/sayeh-2.otf"),
        "Tharwat Emara Modern Regular": require("../assets/fonts/SignatureFonts/tharwat-emara-modern-regular.ttf"),
        Rzgar: require("../assets/fonts/SignatureFonts/rzgar.ttf"),
        "B Fatemi": require("../assets/fonts/SignatureFonts/b-fatemi.ttf"),
        "Alnaqaya S": require("../assets/fonts/SignatureFonts/alnaqaya-s.ttf"),
        "Dima Ravan Nevis": require("../assets/fonts/SignatureFonts/dima-ravan-nevis.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }

    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <SafeAreaProvider>
                    <BottomSheetModalProvider>
                        <AppInner />
                        <ErrorBottomSheet />

                        <Stack
                            initialRouteName="index"
                            screenOptions={{
                                headerShown: false,
                                animation: "none",

                            }}
                        />
                        {!isOnline && <NoInternet />}
                        {updateAvailable && (
                            <UpdateApp
                                visible={true}
                                latestVersion={latestVersion}
                                onClose={() => { }}
                            />
                        )}
                    </BottomSheetModalProvider>
                </SafeAreaProvider>
            </Provider>
        </GestureHandlerRootView>
    );
}
