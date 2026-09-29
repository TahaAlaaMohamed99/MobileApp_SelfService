import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDesignSystem } from "../hooks/useDesignSystem";
import { IconClose, IconError, IconSuccess, IconWarning, IconInfo } from "../assets/IconsSvg";
import AutoFontText from "./AutoFontText";

const CustomToast = ({ text1, text2, hide, type }) => {
    const { colors, spacing, iconSize } = useDesignSystem();
     const getColor = () => {
        switch (type) {
            case "success":
                return colors.success;
            case "error":
                return colors.error;
            case "warning":
                return colors.warning;
            case "info":
                return colors.primary;
            default:
                return colors.border;
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return IconSuccess;
            case "error":
                return IconError;
            case "warning":
                return IconWarning;
            case "info":
                return IconInfo;
            default:
                return IconInfo;
        }
    };

    const Icon = getIcon();

    return (
        <View style={[styles.customToast, { backgroundColor: getColor(), padding: spacing.md, borderRadius: spacing.md, borderWidth: 1, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }}>
               
                <Icon color={"#F0F4FF"} size={iconSize.lg} />
                <View style={styles.textContainer}>
                    <AutoFontText value={text1} color="#F0F4FF" size="sm" weight="medium" />
                    {text2 && <AutoFontText value={text2} color="#F0F4FF" size="sm" weight="regular" />}
                </View>
            </View>
            <TouchableOpacity style={{ alignItems: "flex-end" }} onPress={() => hide()}>
                <IconClose color={"#F0F4FF"} size={iconSize.md} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    customToast: {
        maxWidth: "85%",
        flexDirection: "row",
        alignItems: "center",
         justifyContent: "space-between",
    },
    textContainer: {
        flex: 1,
    },
});

export default CustomToast;
