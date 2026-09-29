import React from 'react';
import { View, Text } from 'react-native';
import SectionContainer from './SectionContainer';
import TranslationText from './TranslationText';
import AutoFontText from './AutoFontText';
import ShimmerBone from './Skeleton/ShimmerBone';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useFormatDateDaly } from '../hooks/useFormatDate';
import { getInitials } from '../utils/getInitials';
import { IconTimeManagement } from '../assets/IconsSvg';

/**
 * AuditTransaction — createdBy/lastModifiedBy/postedBy audit trail cards for
 * an existing (id > 0) transaction record.
 */
export default function AuditTransaction({ data, id, style }) {
  const { colors, spacing, radius, fonts, text, rowDirection,rf, currentLanguage, stylesText, iconSize } = useDesignSystem();

  if (id <= 0) return null;

  const auditCards = [
    {
      label: 'createdBy',
      name: data?.createdByName,
      date: data?.createdOn,
      employeeName: data?.createdByEmployeeName,
      avatarBg: colors.disabled,
      avatarColor: colors.disabledText,
    },
    {
      label: 'lastModifiedBy',
      name: data?.modifiedByName,
      date: data?.modifiedOn,
      employeeName: data?.modifiedByEmployeeName,
      avatarBg: `${colors.warning}22`,
      avatarColor: colors.warning,
    },
    {
      label: 'postedBy',
      name: data?.postedByName,
      date: data?.postedBy,
      employeeName: data?.postedByEmployeeName,
      avatarBg: `${colors.primary}22`,
      avatarColor: colors.primary,
    },
  ];

  return (
    <SectionContainer ResourcePage="GeneralTransaction" title="AuditTransaction" style={style}>
      {auditCards.map((item, index) => {
        const isEmpty = !item.name?.trim() && !item.date;
        const label = item.label === 'postedBy' && data?.postedBy > 0 && data?.status === 1 ? 'unPostedby' : item.label;

        return (
          <View
            key={index}
            style={{
              flexDirection: rowDirection,
               gap: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              backgroundColor: colors.background,
              padding: spacing.md,
              minHeight: 90,
            }}
          >
            {isEmpty ? (
              <>
                <ShimmerBone width={48} height={48} borderRadius={24} color={colors.disabled} />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <TranslationText
                    title={item.label}
                    page="GeneralTransaction"
                    style={stylesText({ color: 'text', size: 'sm', weight: 'semiBold' })}
                  />
                  <ShimmerBone height={14} width="70%" borderRadius={radius.sm}  color={colors.disabled}/>
                  <ShimmerBone height={12} width="50%" borderRadius={radius.sm}  color={colors.disabled}/>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    width: rf(48),
                    height: rf(48),
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item.avatarBg,
                  }}
                >
                  <Text style={{ color: item.avatarColor, fontFamily: fonts.semiBold, fontSize: text.sm }}>
                    {item.name ? getInitials(item.name) : ''}
                  </Text>
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <TranslationText
                    title={label}
                    page="GeneralTransaction"
                    style={stylesText({ color: 'text', size: 'sm', weight: 'semiBold' })}
                  />

                  <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2 }}>
                    <AutoFontText
                      value={item.name || '-'}
                      color="title"
                      size="md"
                      weight="semiBold"
                      numberOfLines={1}
                    />
                    {item.employeeName && (
                      <AutoFontText
                        value={item.employeeName}
                        color="text"
                        size="sm"
                        style={{ flexShrink: 1 }}
                        numberOfLines={1}
                      >
                        ({item.employeeName})
                      </AutoFontText>
                    )}
                  </View>

                  <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2 }}>
                    <IconTimeManagement color={colors.text} size={iconSize.xs} />
                    <Text style={stylesText({ color: 'text', size: 'sm',weight:"medium" })}>
                      {item.date ? useFormatDateDaly(item.date, currentLanguage) : '-'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        );
      })}
    </SectionContainer>
  );
}
