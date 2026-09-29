export const typography = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    base: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
    xxxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  // LTR = Roboto, RTL = Cairo (same as web)
  families: {
    ltr: 'Roboto',
    ltrMedium: 'Roboto-Medium',
    ltrSemiBold: 'Roboto-SemiBold',
    ltrBold: 'Roboto-Bold',
    rtl: 'Cairo',
    rtlMedium: 'Cairo-Medium',
    rtlSemiBold: 'Cairo-SemiBold',
    rtlBold: 'Cairo-Bold',
  },
};

// Tailwind-style shorthand: text.xs, text.sm, text.md, text.lg…
export const text = typography.sizes;
