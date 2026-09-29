import { useMemo } from 'react';
import { View } from 'react-native';
import { useDesignSystem } from './useDesignSystem';
import { getStatusColor } from '../utils/statusColor';
import TranslationText from '../components/TranslationText';
import BackToggle from '../components/BackToggle';
import Generallist from '../ConfigData/Generallist.json';
/**
 * Header options for add/edit transaction screens: BackToggle as headerLeft,
 * and a headerTitle showing the page title with the record's workflow
 * status (dot + statusName) underneath it, matching StatusCell's pattern.
 */
export function useHeaderOptionsAddEdit({ ResourcePage, data, showStatus = true, keySubTilte = null }) {
  const { colors, fonts, spacing, stylesText, rowDirection } = useDesignSystem();
  const statusColor = getStatusColor({ generallist: 'WorkflowStatus', secondKey: 'status' }, data, colors);
  const statusName = Generallist.WorkflowStatus.find((status) => status.value == data?.status);
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.title, fontFamily: fonts.semiBold },
      headerShadowVisible: false,
      headerTintColor: colors.title,
      headerLeft: () => <BackToggle />,
      headerTitle: () => (
        <View style={{ flexDirection: 'column', paddingInlineStart: spacing.sm }}>
          <TranslationText
            page={ResourcePage}
            title="title"
            style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
            numberOfLines={1}
          />
          {(data?.status && showStatus) && (
            <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: statusColor }} />
              <TranslationText
                titleGenerallist
                page="WorkflowStatus?.values"
                title={statusName?.label}
                style={[stylesText({ color: statusColor, size: 'xs', weight: 'bold' }), { textTransform: 'uppercase' }]}
                numberOfLines={1}
              />
            </View>
          )}
          {(keySubTilte != null) && (
            <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs / 2, marginTop: 2 }}>
              <TranslationText
                title={data[keySubTilte]}
                style={[stylesText({ color: 'text', size: 'md', weight: 'bold' }), { textTransform: 'capitalize' }]}
                numberOfLines={1}
              />
            </View>
          )}
        </View>
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ResourcePage, data?.status, statusColor, rowDirection, spacing, stylesText, colors, fonts]
  );
}
