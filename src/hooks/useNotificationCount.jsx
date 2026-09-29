// hooks/useNotificationCount.js

import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDispatch } from "react-redux";
import { getApi } from "../services/Api";
import { useUserData } from "./useUserData";
import { setNotificationLength } from "../store/NotificationsSlice";

export const useNotificationCount = () => {
    const dispatch = useDispatch();
    const { userId } = useUserData();
    const api = getApi();

    const loadNotificationCount = () => {
        if (!userId) return;
 
        api.get(`Notification/UnReadCount?userId=${userId}`).then((res) => {
            const count = Number(res?.data ?? res) || 0;
            dispatch(setNotificationLength(count));
        }).catch((err) => {
         });
    };

    useFocusEffect(
        useCallback(() => {
            loadNotificationCount();

        }, [userId])
    );
};
