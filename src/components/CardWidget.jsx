import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import TranslationText from "./TranslationText";
import { getApi } from "../services/Api";
import dayjs from "dayjs";
import { useDesignSystem } from "../hooks/useDesignSystem";
import { useUserData } from "../hooks/useUserData";
import { useFocusEffect } from "expo-router";

export default function CardWidget({
    card,
    moduleData,
    isCallApi = true,
    ResourcePage,
}) {
    const {
        colors,
        spacing,
        radius,
        currentShadow,
        stylesText,
        rowDirection,
        isRTL,
        iconSize,
        currentLanguage
    } = useDesignSystem();

    const { employeeId } = useUserData();
    const Icon = card?.icon;
    const IconComponent = typeof Icon === 'function' ? Icon : null;

    const api = getApi();

    const [data, setData] = useState({});

  useFocusEffect(
    useCallback(() => {
        if (isCallApi && card.urlApi) {
             if (card.isSelfService ? employeeId > 0 : true) {
                api.get(
                    `${card.urlApi}${card.isSelfService ? `?employeeRecId=${employeeId}` : ""}`
                ).then((response) => {
                    setData(response);
                }).catch(() => { });
            }

        } else {
            setData(moduleData);
        }
    }, [card,employeeId])
  );
    const formatTypes = {
        day: "D",
        month: "MMM",
        year: "YYYY",
        dayMonth: "D MMM",
    };
const formattedDate = dayjs().locale(currentLanguage).format(formatTypes[card?.formated]);

    const styles = createStyles({ colors, spacing, radius, currentShadow, stylesText, rowDirection, isRTL });

    return (
        <TouchableOpacity
            style={[styles.cardCounter, card?.style]}
            activeOpacity={card?.onClick ? 0.7 : 1}
            onPress={card?.onClick ? () => card.onClick() : undefined}
            disabled={!card?.onClick}
        >
            <View style={styles.headerCard}>
                <View style={styles.iconWrapper}>{<IconComponent size={iconSize.lg} color={colors[card?.classNameIcon]} />}</View>
                <View style={styles.titleWrapper}>
                    <TranslationText
                        title={card?.title}
                        style={[
                             styles.title,
                        ]}
                        page={ResourcePage ? ResourcePage : "Dashboard"}
                    />

                    {card?.subtitle ? (

                        (<TranslationText style={styles.subtitle} title={card?.subtitle} page={"General"} />)
                    ) : card?.formated ? (
                        <Text style={styles.subtitle}> ({formattedDate})</Text>
                    ) : null}
                </View>
            </View>

            <View style={styles.bodyCard}>
                <View style={styles.valueCounter}>
                    <Text style={[styles.counterChar]}>
                        {data[card?.firstkeyValue] ?? "0"}
                    </Text>

                    {card?.firstLabel && (
                        <Text style={styles.subValue}>
                            {" "}
                            <TranslationText title={card?.firstLabel} page={card?.firstPage || "Dashboard"} />
                        </Text>
                    )}
                </View>

                {card?.secendkeyValue && (
                    <View style={styles.valueCounter}>
                        <Text style={[styles.counterChar]}>
                            {data[card?.secendkeyValue] ?? "0"}
                        </Text>

                        {card?.secendLabel && (
                            <Text style={styles.subValue}>
                                {" "}
                                <TranslationText title={card?.secendLabel} page={"Dashboard"} />
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const createStyles = ({ colors, spacing, radius, currentShadow, stylesText, rowDirection, isRTL }) =>
    StyleSheet.create({
        cardCounter: {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.md,
            ...currentShadow,
        },
        headerCard: {
            flexDirection: rowDirection,
            alignItems: "center",
            marginBottom: spacing.lg,
        },
        iconWrapper: {
            marginRight: isRTL ? 0 : spacing.xs,
            marginLeft: isRTL ? spacing.xs : 0,
        },
        titleWrapper: {
            flexDirection: rowDirection,
            flexWrap: "wrap",
            flexShrink: 1,
            alignItems: "flex-end"
        },
        title: {
            ...stylesText({ color: "title", size: "md", weight: "bold" }),
            fontSize:15
        },
        subtitle: {
            ...stylesText({ color: "text", size: "sm", weight: "medium" }),
        },
        bodyCard: {
            flexDirection: rowDirection,
            justifyContent: "space-between",
            alignItems: "flex-end",
        },
        valueCounter: {
            flexDirection: rowDirection,
            alignItems: "baseline",
        },
        counterChar: {
            ...stylesText({ color: "title", size: "xl", weight: "bold" }),
        },
        subValue: {
            ...stylesText({ color: "text", size: "md", weight: "medium" }),
        },
    });