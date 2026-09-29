import { useMemo } from 'react';
import { useColorScheme, useWindowDimensions, PixelRatio, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, typography, shadows, radius, iconSizes } from '../theme';

const BREAKPOINTS = { mobile: 768, tablet: 1024 };
const BASE_WIDTH = 393;


const PHONE_MIN = 320;
const PHONE_MAX = 430;
/**
 * Single entry point for everything design-system related: theme (colors,
 * spacing, typography), RTL/i18n direction, and responsive scaling.
 */
export const useDesignSystem = () => {
  const deviceScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const reduxTheme = useSelector((state) => state.themeSlice.theme);
  const currentLanguage = useSelector((state) => state.themeSlice.currentLanguage);

  const isDark = reduxTheme === 'dark';
  const isRTL = currentLanguage === 'ar';

  return useMemo(() => {
    const rf = (size) => {
      if (width >= BREAKPOINTS.mobile) {
        const tabletScale = 1.08;
        return PixelRatio.roundToNearestPixel(size * tabletScale);
      }
      const clampedWidth = Math.min(Math.max(width, PHONE_MIN), PHONE_MAX);
      const scale = clampedWidth / BASE_WIDTH;
      return (size * scale);
    };

    const scaleMap = (map) =>
      Object.fromEntries(Object.entries(map).map(([key, value]) => [key, rf(value)]));

    const scaledSizes = scaleMap(typography.sizes);
    const scaledSpacing = scaleMap(spacing);
    const scaledIconSizes = scaleMap(iconSizes);
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isLargeTablet = width >= BREAKPOINTS.tablet;
    const palette = isDark ? colors.dark : colors.light;
     const fonts = {
      regular: isRTL ? typography.families.rtl : typography.families.ltr,
      medium: isRTL ? typography.families.rtlMedium : typography.families.ltrMedium,
      semiBold: isRTL ? typography.families.rtlSemiBold : typography.families.ltrSemiBold,
      bold: isRTL ? typography.families.rtlBold : typography.families.ltrBold,
    };

    const getGridColumns = (mobile = 1, tablet = 2, large = 3) =>
      isLargeTablet ? large : isTablet ? tablet : mobile;

    const getCardWidth = (numColumns, gap = 16) => {
      const totalGaps = gap * (numColumns + 1);
      return (width - totalGaps) / numColumns;
    };
    const getPeekCardWidth = () => {
      const numCards = isLargeTablet ? 3 : isTablet ? 2.25 : 1.5;

      return (width - scaledSpacing.xl) / numCards;
    };

    const currentShadow = isDark
      ? shadows.dark
      : shadows.light;
    const stylesText = ({ color, size, weight, align }) => {
      return {
        color: color ? palette[color] ?? color : palette.text,
        fontSize: size ? scaledSizes[size] : scaledSizes.md,
        fontFamily: weight ? fonts[weight] : fonts.regular,
        fontWeight: 'normal',
        textAlign: align || "start",
       }
    }
    const labelTxt = {
      ...stylesText({ color: "title", size: "md", weight: "medium" })
    };
    const errorTxt = {
      ...stylesText({ color: "error", size: "sm", weight: "regular" }),
      marginTop: 2,
    };
    const titleSections = {
      ...stylesText({ color: "title", size: "lg", weight: "bold" }),
      marginBottom: scaledSpacing.md,
    };
    const globalStyles = StyleSheet.create({
      screen: {
        flex: 1,
      },
      Sections: {
        marginBottom: scaledSpacing.lg
      },
      container: {
        flex: 1,
        paddingHorizontal: scaledSpacing.base,
        backgroundColor: palette.background,
      },
      titleSections,
      labelTxt: labelTxt,
      errorTxt: errorTxt,
      containerFiled: {
        marginBottom: scaledSpacing.base,
      },
      center: {
        justifyContent: "center",
        alignItems: "center",
      },
      btnHeaderActions: {
        backgroundColor: palette.surface,
        justifyContent: "center",
        alignItems: "center",
        padding: scaledSpacing.xs,
        width: rf(44),
        height: rf(44),
        borderRadius: radius.md,
        ...currentShadow,
      },
      btnActions: {
        backgroundColor: palette.surface,
        justifyContent: "center",
        alignItems: "center",
        padding: scaledSpacing.sm,
        opacity: 0.85,
        borderRadius: radius.md,
        ...currentShadow,
      },
      btnActionsArrow: {
        backgroundColor: palette.surface,
        justifyContent: "center",
        opacity: 0.85,
        alignItems: "center",
        padding: scaledSpacing.xs / 2,
        borderRadius: radius.sm,
        ...currentShadow,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
      },
      card: {
        backgroundColor: palette.surface,
        borderRadius: radius.lg,
        padding: scaledSpacing.base,
        marginBottom: scaledSpacing.sm,
        gap: scaledSpacing.md,
        ...currentShadow,
      },

    });
    return {
      colors: palette,
      spacing: scaledSpacing,
      typography,
      text: scaledSizes,
      iconSize: scaledIconSizes,
      currentShadow,
      shadows,
      stylesText,
      radius,
      isDark,
      fonts,
      isRTL,
      currentLanguage,
      rowDirection:  'row',
      writingDirection: "start",
      width,
      height,
      isMobile,
      isTablet,
      isLargeTablet,
      globalStyles,
      wp: (pct) => (width * pct) / 100,
      hp: (pct) => (height * pct) / 100,
      rf,
      getGridColumns,
      getCardWidth,
      getPeekCardWidth
    };
  }, [width, height, isDark, isRTL, currentLanguage]);
};
