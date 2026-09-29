import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import TranslationText from '../TranslationText';
import AutoFontText from '../AutoFontText';
import SectionContainer from '../SectionContainer';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import useGetGenerallist from '../../hooks/useGetGenerallist';
import { IconRejected, IconApproved, IconPending, IconComment, IconClose } from '../../assets/IconsSvg';
import SubLevelCard, { STATUS_APPROVED, STATUS_REJECTED } from './SubLevelCard';
import { useFocusEffect } from 'expo-router';

/**
 * WorkFlowTransactionLog — approval-levels slider ported 1:1 from the web
 * self-service app's WorkFlowTransactionLog.jsx + style.css. `workFlowTransaction`
 * is the grouped-by-level payload from useGetWorkFlowTransactionLog:
 * { totalLevels, isFullyApproved, isRejected, levels }.
 */
export default function WorkFlowTransactionLog({ workFlowTransaction = null, isLoading, setIsLoading }) {
  const ds = useDesignSystem();
  const { colors, spacing, radius, stylesText, rowDirection, iconSize } = ds;
  const { getGenerallist } = useGetGenerallist();
  const [statusWorkFlowList, setStatusWorkFlowList] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const sheetRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      getGenerallist('StatusWorkFlow', setIsLoading, setStatusWorkFlowList);
    }, [])
  );

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const openComment = (sub) => {
    setSelectedComment(sub);
    sheetRef.current?.present();
  };

  const data = workFlowTransaction;
  if (!(data?.totalLevels > 0)) return null;

  const countColor = data?.isFullyApproved ? 'primary' : data?.isRejected ? 'error' : 'text';
  const commentText = selectedComment?.comments?.[0]?.description || selectedComment?.comments?.[0];

  return (
    <>
      <SectionContainer
        ResourcePage="WorkFlow"
        title="title"
        titleExtra={<Text style={stylesText({ color: countColor, size: 'md', weight: 'bold' })}>({data.totalLevels})</Text>}
      >
        {data.levels?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.levels.map((level, index) => (
              <View
                key={index}
                style={{
                  marginHorizontal: spacing.xs,
                  paddingEnd: index < data.levels.length - 1 ? spacing.sm : 0,
                  paddingStart: index === 0 ? 0 : spacing.sm,
                  borderEndWidth: index < data.levels.length - 1 ? 2 : 0,
                  borderStyle: 'dashed',
                  borderEndColor: colors.border,
                }}
              >
                <View style={{ flexDirection: rowDirection, justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.base }}>
                  {level.levelStatus === STATUS_REJECTED ? (
                    <IconRejected color={colors.error} size={iconSize.sm} />
                  ) : level.levelStatus === STATUS_APPROVED ? (
                    <IconApproved color={colors.primary} size={iconSize.sm} />
                  ) : (
                    <IconPending color={colors.text} size={iconSize.sm} />
                  )}
                  <TranslationText page="WorkFlowLevel" title="Level" style={stylesText({ color: 'text', size: 'md', weight: 'semiBold' })} />
                  <Text style={stylesText({ color: 'text', size: 'md', weight: 'semiBold' })}>{level.levelNumber}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  {level.subLevels?.map((sub, subIndex) => (
                    <SubLevelCard
                      key={subIndex}
                      sub={sub}
                      isRejected={data?.isRejected}
                      statusWorkFlowList={statusWorkFlowList}
                      onOpenComment={openComment}
                     />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={stylesText({ color: 'disabledText', size: 'sm' })}>No level logs available.</Text>
        )}
      </SectionContainer>

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        enableDynamicSizing
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        backdropComponent={renderBackdrop}
        onDismiss={() => setSelectedComment(null)}
      >
        <BottomSheetView style={{ padding: spacing.base, gap: spacing.base, paddingBottom: spacing.xl }}>
          <View style={{ flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm, flex: 1 }}>
              <View style={{ padding: spacing.sm, borderRadius: radius.md, backgroundColor: `${colors.title}22` }}>
                <IconComment color={colors.title} size={iconSize.base} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: rowDirection, gap: spacing.xs,alignItems:"center" }}>
                  <TranslationText page="WorkFlow" title="CommentBy" style={stylesText({ color: 'title', size: 'base', weight: 'bold' })} />
                  <AutoFontText value={selectedComment?.employeeName} color="title" size="base" weight="bold" />
                </View>
                {selectedComment?.positionName && (
                  <AutoFontText value={selectedComment.positionName} color="text" size="sm" numberOfLines={1} />
                )}
              </View>
            </View>
    
          </View>

          <AutoFontText value={commentText} color="text" size="base" />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
