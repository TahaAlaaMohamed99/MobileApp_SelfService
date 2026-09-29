import React from 'react';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import useTranslationText from '../hooks/useTranslationText';
import { useDesignSystem } from '../hooks/useDesignSystem';

export default function TranslationText({
  page,
  title,
  titleGenerallist = false,
  style,
  numberOfLines,
  ...props
}) {
  const { fonts, currentLanguage } = useDesignSystem();
  const ReduxResources = useSelector((state) => state.resourcesSlice.ReduxResources);

  const translatedText = useTranslationText({
    page,
    title,
    lang: currentLanguage,
    titleGenerallist,
    Resources: ReduxResources,
  });

  return (
    <Text style={[style]} numberOfLines={numberOfLines} {...props}>
      {translatedText}
    </Text>
  );
}
