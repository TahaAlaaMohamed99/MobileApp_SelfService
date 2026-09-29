import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconArrow, IconArrowLeft } from '../assets/IconsSvg';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Pages } from '../ConfigData/Pages';
import TranslationText from './TranslationText';

export default function CardQuickTransaction({ transaction, style }) {
    const { colors, spacing, radius, currentShadow, rowDirection, isRTL, stylesText, getPeekCardWidth, iconSize } = useDesignSystem();
    const Icon = transaction?.icon;
    const CARD_WIDTH = getPeekCardWidth();
    const IconComponent = typeof Icon === 'function' ? Icon : null;
    const isDisabled = Pages.find((page) => page.keyPage === transaction?.keyPage)?.disabled === true;

    const handlePress = () => {
        if (!transaction?.RouterPage) return;

        router.push({
            pathname: `/(protected)/(tabs)/${transaction.RouterPage}`,
            params: { prevRoute: '/' },
        });
    };

    return (
        <Pressable
            onPress={isDisabled ? undefined : handlePress}
            disabled={isDisabled}
            style={({ pressed }) => [
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.base,
                    width: CARD_WIDTH,
                    opacity: isDisabled ? 0.4 : pressed ? 0.75 : 1,
                    ...currentShadow,
                },
                style,
            ]}
        >

            <View style={{position:"absolute",insetInlineEnd:spacing.base,top:spacing.base,    transform: [{ rotate: '135deg' }],
}}>
                <IconArrow   color={colors.text} size={iconSize.sm}/>
            </View>
            <View style={{ width: "100%", marginBottom: spacing.base }}>
                {IconComponent ? <IconComponent color={colors.title} size={iconSize.xxl} /> : null}
            </View>

            <TranslationText
                page={transaction?.keyPage}
                title="request"
                numberOfLines={1}
                style={[
                    stylesText({ color: 'title', size: 'md', weight: 'medium' }),
                ]}
            />
        </Pressable>
    );
}

