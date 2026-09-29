import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
    const { colors, globalStyles } = useDesignSystem();

    return (
        <SafeAreaView
            style={[globalStyles.container]}
        >
            <Stack
                screenOptions={{
                    animation: "slide_from_right",
                    headerBackVisible: false,
                    headerShown: false,

                }}
            >
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background },
                    }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    options={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background },
                    }}
                />
            </Stack>
        </SafeAreaView>
    )
}