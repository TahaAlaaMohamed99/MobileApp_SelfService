import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { createStyles } from '../ProfileStyles';
import ShimmerBone from './ShimmerBone';

export default function ProfileSkeleton() {
  const { colors, spacing, radius, currentShadow, rowDirection, iconSize, rf } = useDesignSystem();
  const profileStyles = createStyles({ colors, spacing, radius, currentShadow, rowDirection, rf });
  const styles = { ...profileStyles, ...extraStyles({ colors, spacing, rowDirection }) };
  const bone = { backgroundColor: colors.border };

  const InfoRow = ({ last }) => (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoLabelWrapper}>
        <ShimmerBone width={iconSize.sm} height={iconSize.sm} borderRadius={iconSize.sm / 2} style={bone} />
        <ShimmerBone width={70} height={12} borderRadius={6} style={bone} />
      </View>
      <ShimmerBone width={130} height={16} borderRadius={6} style={bone} />
    </View>
  );

  const IdCard = () => (
    <View style={styles.idCard}>
      <View style={styles.idCardHeader}>
        <ShimmerBone width={iconSize.sm} height={iconSize.sm} borderRadius={iconSize.sm / 2} style={bone} />
        <ShimmerBone width={70} height={12} borderRadius={6} style={bone} />
      </View>
      <ShimmerBone width={90} height={20} borderRadius={6} style={bone} />
    </View>
  );

  const ActionRow = ({ style, trailing }) => (
    <View style={[styles.actionRow, style]}>
      <View style={styles.actionLabel}>
        <ShimmerBone width={iconSize.md} height={iconSize.md} borderRadius={iconSize.md / 2} style={bone} />
        <ShimmerBone width={90} height={16} borderRadius={6} style={bone} />
      </View>
      {trailing}
    </View>
  );

  return (
    <View style={{ paddingTop: spacing.lg, gap: spacing.md }}>
      <View style={styles.profileCard}>
        <ShimmerBone width={rf(70)} height={rf(70)} borderRadius={10} style={bone} />
        <View style={styles.identityWrapper}>
          <ShimmerBone width={140} height={18} borderRadius={6} style={[bone, { marginBottom: spacing.xs }]} />
          <ShimmerBone width={100} height={14} borderRadius={6} style={[bone, { marginBottom: spacing.xs }]} />
          <ShimmerBone width={160} height={12} borderRadius={6} style={bone} />
        </View>
      </View>

      <View style={{ flexDirection: 'column', gap: spacing.md }}>
        <View style={styles.idCardsRow}>
          <IdCard />
          <IdCard />
        </View>
        <View style={styles.infoCard}>
          <InfoRow />
          <InfoRow />
          <InfoRow last />
        </View>
      </View>

      <View style={{ flexDirection: 'column', gap: spacing.sm, marginTop: spacing.md }}>
        <ShimmerBone width={90} height={16} borderRadius={6} style={[bone, { marginBottom: spacing.xs }]} />
        <View style={styles.actionsList}>
          <ActionRow
            trailing={
              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs }}>
                <ShimmerBone width={40} height={14} borderRadius={6} style={bone} />
                <ShimmerBone width={iconSize.sm} height={iconSize.sm} borderRadius={iconSize.sm / 2} style={bone} />
              </View>
            }
          />
          <ActionRow
            trailing={<ShimmerBone width={44} height={24} borderRadius={12} style={bone} />}
          />
          <ActionRow style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    </View>
  );
}

const extraStyles = ({ colors, spacing, rowDirection }) =>
  StyleSheet.create({
    infoRow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: spacing.xs,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderColor: colors.background,
    },
    infoRowLast: {
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    infoLabelWrapper: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: spacing.xs,
    },
  });
