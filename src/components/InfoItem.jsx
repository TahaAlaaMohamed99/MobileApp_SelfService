import { View, StyleSheet } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';
import AutoFontText from './AutoFontText';
import { toTitleCase } from '../utils/textUtils';

export default function InfoItem({ Icon, label, value, page, last, titleCase = false }) {
  const { colors, spacing, stylesText, rowDirection, iconSize } = useDesignSystem();
  const styles = createStyles({ colors, spacing, rowDirection });
  const displayValue = titleCase ? toTitleCase(value) : value;

  return (
    <View style={[styles.infoItem, last && styles.infoItemLast]}>
      {Icon && <Icon color={colors.text} size={iconSize.base} />}

      <View style={styles.infoLabelWrapper}>
        <TranslationText
          page={page}
          title={label}
          style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })}
        />
        <AutoFontText value={displayValue || '-'} color="title" size="md" weight="medium" numberOfLines={1} />

      </View>
    </View>
  );
}

const createStyles = ({ colors, spacing, rowDirection }) =>
  StyleSheet.create({
    infoItem: {
      flexDirection: 'row',
        gap: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderColor: colors.background,
    },
    infoItemLast: {
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    infoLabelWrapper: {
      flexDirection: 'column',
     },
  });
