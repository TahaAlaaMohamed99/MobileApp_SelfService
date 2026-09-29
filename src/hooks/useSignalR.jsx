// hooks/useSignalR.js
import { useEffect, useState, useCallback } from "react";
import signalRService from "../services/signalRService";
import { useUserData } from "./useUserData";
import * as SecureStore from 'expo-secure-store';

export const useSignalR = () => {
    const [isConnected, setIsConnected] = useState(false);
    const { userId } = useUserData();

    useEffect(() => {
        let isMounted = true;

        const startConnection = async () => {
            if (!userId) return;

            try {
                const [userToken, apiUrl] = await Promise.all([
                    SecureStore.getItemAsync('accessToken'),
                    SecureStore.getItemAsync('apiUrl'),
                ]);

                if (!userToken || !apiUrl) {
                    if (isMounted) setIsConnected(false);
                    return;
                }

                const connection = await signalRService.startConnection(apiUrl, userToken, userId);
                if (isMounted) {
                    setIsConnected(!!connection);
                }
            } catch (error) {
                if (isMounted) {
                    setIsConnected(false);
                }
            }
        };

        startConnection();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    const on = useCallback((methodName, callback) => {
        signalRService.on(methodName, callback);
    }, []);

    const off = useCallback((methodName) => {
        signalRService.off(methodName);
    }, []);

    const invoke = useCallback(async (methodName, ...args) => {
        return await signalRService.invoke(methodName, ...args);
    }, []);

    const sendNotification = useCallback(
        async (userId, transactionRecId, transactionName, code, status) => {
            return await signalRService.sendNotification(
                userId,
                transactionRecId,
                transactionName,
                code,
                status
            );
        },
        []
    );

    return { isConnected, on, off, invoke, sendNotification };
};
