import { typography } from '../theme/typography';

const ARABIC_REGEX = new RegExp(
  '[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]'
);

const WEIGHT_SUFFIX = {
  regular: '',
  medium: 'Medium',
  semiBold: 'SemiBold',
  bold: 'Bold',
};

export const isArabicText = (value) => ARABIC_REGEX.test(String(value ?? ''));

export const getFontFamily = (value, weight = 'regular') => {
  const prefix = isArabicText(value) ? 'rtl' : 'ltr';
  return typography.families[`${prefix}${WEIGHT_SUFFIX[weight] ?? ''}`];
};
