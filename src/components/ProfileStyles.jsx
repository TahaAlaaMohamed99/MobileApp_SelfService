import { StyleSheet } from 'react-native';

export const createStyles = ({ colors, spacing, radius, currentShadow, rowDirection, rf }) =>
  StyleSheet.create({
    container: {
      paddingTop: spacing.lg,
    },
    section: {
      flexDirection: 'column',
      gap: spacing.sm,
      marginBottom: spacing.base,
    },
    profileCard: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      ...currentShadow,
    },
    avatar: {
      width: rf(80),
      height: rf(80),
      borderRadius: 100,
      borderColor: colors.background,
      borderWidth: 3,
      ...currentShadow,
      backgroundColor: colors.surface,
    },
    identityWrapper: {
      alignItems: 'flex-start'
    },
    badge: {
      marginTop: spacing.xs,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
    },
    actionsList: {
      gap: spacing.md,
    },
    actionRow: {
      flexDirection: rowDirection,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.md,
      ...currentShadow,
    },
    infoCard: {
      flexDirection: 'column',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      ...currentShadow,
    },
    idCardsRow: {
      marginTop: spacing.md,
      flexDirection: rowDirection,
      gap: spacing.md,
    },
    idCard: {
      flex: 1,
      flexBasis: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      ...currentShadow,
    },
    idCardHeader: {
      flexDirection: 'column',
      gap: spacing.xs,
    },
    actionLabel: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: spacing.sm,
    },
  });
