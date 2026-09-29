// hooks/useGeneralParameter.js

import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDispatch } from "react-redux";
import { getApi } from "../services/Api";
import { setGeneralParameter } from "../store/generalParameterSlice";

export const useGeneralParameter = (setLoading) => {
    const dispatch = useDispatch();
    const api = getApi();

    const loadGeneralParameter = () => {
        setLoading?.(true);
        api.get('GeneralParameter/GetAll').then((res) => {
            dispatch(setGeneralParameter(res?.data[0] || null));
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setLoading?.(false);
        });
    };

    useFocusEffect(
        useCallback(() => {
            loadGeneralParameter();

        }, [])
    );
};
