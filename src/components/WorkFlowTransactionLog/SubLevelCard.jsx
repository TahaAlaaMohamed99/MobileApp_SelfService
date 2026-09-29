import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import AutoFontText from '../AutoFontText';
import { useImage } from '../../hooks/useImage';
import { useFormatDateDaly } from '../../hooks/useFormatDate';
import { isArabicText } from '../../utils/getFontFamily';
import { EmployeeSignatureText } from '../../utils/EmployeeSignatureText';
import { IconComment } from '../../assets/IconsSvg';
import avatarMan from '../../assets/images/avatarMan.png';
import avatarWoman from '../../assets/images/avatarWoman.png';
import { useDesignSystem } from '../../hooks/useDesignSystem';

export const STATUS_APPROVED = 2;
export const STATUS_REJECTED = 4;

function BlurredText({ text, style, tint }) {
  return (
    <View style={{ position: "relative", overflow: 'hidden' }}>
      <Text numberOfLines={1} style={style}>
        {text}
      </Text>
      <BlurView
        intensity={8}
        tint={tint}
        experimentalBlurMethod="dimezisBlurView"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </View>
  );
}

export default function SubLevelCard({ sub, isRejected, statusWorkFlowList, onOpenComment }) {
  const { colors, spacing, radius, rf, stylesText, getPeekCardWidth, rowDirection, iconSize, text, isTablet, isLargeTablet, currentLanguage, isDark } = useDesignSystem();
  const blurTint = isDark ? 'dark' : 'light';
  const CARD_WIDTH = getPeekCardWidth();

  const isApproved = sub.status === STATUS_APPROVED;
  const isRejectedSub = sub.status === STATUS_REJECTED;
  const isSignedByThisEmployee = sub?.modifiedBy === sub?.employeeRecId;

  const avatarBorderColor = isRejectedSub ? colors.error : isApproved ? colors.primary : colors.text;
  const pillBgColor = isRejectedSub ? colors.error : isApproved ? colors.primary : colors.border;
  const pillTextColor = isRejectedSub || isApproved ? colors.background : colors.text;
  const hideStatusLabel = ((isApproved || isRejectedSub) && !isSignedByThisEmployee) || (isRejected && sub.status === 1);

  const statusLabel = statusWorkFlowList?.find((status) => status.value === sub.status)?.label;

  const employeeImageUri = useImage(sub?.employeeImage);
  const signatureImageUri = useImage(sub?.employeeSignatureType === 1 ? sub?.employeeSignature : null);
  const signatureFont = EmployeeSignatureText(sub?.employeeSignature)?.label;
  const fallbackFont = isArabicText(sub?.employeeName) ? 'Tharwat Emara Modern Regular' : 'DancingScript';
  const shouldBlurSignature = sub?.modifiedBy !== sub?.employeeRecId;

  return (
    <View
      style={{
        borderRadius: radius.xl,
        backgroundColor: colors.background,
        padding: spacing.base,
        gap: spacing.sm,
        width: CARD_WIDTH
      }}
    >
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{
            width: rf(55),
            height: rf(55),
            borderRadius: radius.md,
            borderWidth: 2,
            borderColor: avatarBorderColor,
            padding: 2,
          }}
        >
          <Image
            source={employeeImageUri ? { uri: employeeImageUri } : sub?.employeeGender == 1 ? avatarMan : avatarWoman}
            style={{ width: '100%', height: '100%', borderRadius: radius.sm }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AutoFontText value={sub.employeeName} color="title" size="md" weight="bold" numberOfLines={1} />
          <AutoFontText value={sub?.positionName} color="text" size="xs" weight="medium" numberOfLines={1} />
        </View>
      </View>

      <View style={{ height: rf(70), width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', position: "relative", justifyContent: 'center' }}>
          {sub?.employeeSignature ? (
            sub?.employeeSignatureType === 1 ? (
              signatureImageUri && (
                <Image
                  source={{ uri: signatureImageUri }}
                  resizeMode="contain"
                  blurRadius={shouldBlurSignature ? 12 : 0}
                  style={{ width: rf(140), height: rf(70) }}
                />
              )
            ) : shouldBlurSignature ? (
              <BlurredText
                text={sub.employeeSignature}
                tint={blurTint}
                style={[stylesText({ color: 'title', size: 'xl' }), { fontFamily: signatureFont || 'DancingScript' }]}
              />
            ) : (
              <Text numberOfLines={1} style={[stylesText({ color: 'title', size: 'xl' }), { fontFamily: signatureFont || 'DancingScript' }]}>
                {sub.employeeSignature}
              </Text>
            )
          ) : shouldBlurSignature ? (
            <BlurredText
              text={sub.employeeName}
              tint={blurTint}
              style={[stylesText({ color: 'title', size: 'xl' }), { fontFamily: fallbackFont }]}
            />
          ) : (
            <Text numberOfLines={1} style={[stylesText({ color: 'title', size: 'xl' }), { fontFamily: fallbackFont }]}>
              {sub.employeeName}
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            backgroundColor: pillBgColor,
            opacity: hideStatusLabel ? 0 : 1,
          }}
        >
          <AutoFontText
            value={statusLabel}
            weight="medium"
            style={{ color: pillTextColor, fontSize: text.xs, textTransform: 'uppercase' }}
          />
        </View>
        <Text style={stylesText({ color: 'title', size: 'xs', weight: 'medium' })}>
          {sub?.modifiedOn ? useFormatDateDaly(sub.modifiedOn, currentLanguage) : ''}
        </Text>
      </View>

      {sub.comments?.length > 0 && (
        <TouchableOpacity
          onPress={() => onOpenComment(sub)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: -rf(10),
            insetInlineEnd: rf(10),
            width: rf(30),
            height: rf(30),
            borderRadius: radius.full,
            backgroundColor: colors.title,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComment color={colors.surface} size={iconSize.sm} />
        </TouchableOpacity>
      )}
    </View>
  );
}
