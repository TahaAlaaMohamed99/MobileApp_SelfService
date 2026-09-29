import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSegments } from 'expo-router';
import DrawerToggle from './DrawerToggle';
import TranslationText from './TranslationText';
import AutoFontText from './AutoFontText';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Pages } from '../ConfigData/Pages';
import { useUserData } from '../hooks/useUserData';

export default function HeaderLeft() {
  const segments = useSegments();
  const pageKey = segments.find((segment) => Pages.some((page) => page.keyPage === segment));
  const { spacing, stylesText, rowDirection, currentLanguage } = useDesignSystem();
  const { CompanyName, EmployeeName } = useUserData();
  return (
    <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm, flexShrink: 1 }}>
      <DrawerToggle />
      <View style={pageKey === 'Dashboard' ? { flexShrink: 1 } : null}>
        {CompanyName && (
          <AutoFontText value={CompanyName} color="text" size="sm" weight="medium" numberOfLines={1} />
        )}
        {pageKey === 'Dashboard' ?
          <Text numberOfLines={1}
          >
            <TranslationText style={stylesText({ color: 'title', size: 'base', weight: 'bold' })} page={"General"} title="hello" />
            <AutoFontText
              value={EmployeeName}
              color="title"
              size="base"
              weight="bold"
              style={{ textTransform: "capitalize" }}
            >
              {", "}
              {EmployeeName}
              {" 👋🏻"}
            </AutoFontText>
          </Text>

          :
          <TranslationText
            page={pageKey}
            title="title"
            style={stylesText({ color: 'title', size: 'base', weight: 'bold' })}
            numberOfLines={1}
          />
        }

      </View>
    </View>
  );
}
