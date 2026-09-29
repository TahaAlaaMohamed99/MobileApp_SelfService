// hooks/useUserData.js

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

const defaultUserData = {
    userName: "",
    isSelfService: false,
    hidenToIsSelfService: true,
    userId: null,
    employeeId: null,
    EmployeeName: null,
    CompanyName: null,
    EmployeeImage:null,
    CompanyLogo: null,
    timeZone: null,
    employeeValue: {
        label: "",
        value: "",
    },
};

export const useUserData = () => {
    const [userData, setUserData] = useState(defaultUserData);
    const [loading, setLoading] = useState(true);
    const currentLanguage = useSelector((state) => state.themeSlice.currentLanguage);
    const loadUserData = async () => {
        try {
            const raw = await AsyncStorage.getItem("user");
            const data = raw ? JSON.parse(raw) : {};
            setUserData({
                userName: data.userName || "",
                isSelfService: data.IsSelfService === "Yes",
                hidenToIsSelfService: data.IsSelfService !== "Yes",
                userId: data.userId || null,
                EmployeeImage:data?.EmployeeImage || null,
                employeeId: data?.EmployeeId > 0 ? Number(data.EmployeeId) : null,
                EmployeeName: data?.EmployeeName || data?.userName || null,
                CompanyName: (currentLanguage === "ar" ? data?.CompanyArabicName : data?.CompanyEnglishName) || data?.companyName || null,
                CompanyLogo: data?.CompanyLogo || null,
                timeZone: data?.timeZone || "Africa/Cairo",
                employeeValue: {
                    label: userData?.EmployeeName,
                    value: userData?.EmployeeId,
                },
            });
        } catch (error) {
            setUserData(defaultUserData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, [currentLanguage]);
    return {
        ...userData,
        loading,
        reloadUserData: loadUserData,
    };
};