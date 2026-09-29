import React, { Children, Fragment } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import TranslationText from './TranslationText';
import { useDesignSystem } from '../hooks/useDesignSystem';

const CIRCLE_SIZE = 44;

/**
 * Stepper — two visual variants depending on mode:
 *  - id > 0 (editing an existing record): horizontal pill tab-bar, steps
 *    are freely clickable navigation tabs, only the exact activeStep is
 *    highlighted.
 *  - id <= 0 (creating a new record): squircle-icon + connector-line
 *    progress indicator, read-only, every step up to and including
 *    activeStep is highlighted.
 *
 * steps: [{ step, icon, title, ResourcePage, disabled, onClick }]
 */
export default function Stepper({
  steps = [],
  activeStep,
  id,
  children,
  ResourcePage,
  style,
}) {
  const { colors, spacing, radius, currentShadow, stylesText, rowDirection, iconSize } = useDesignSystem();
  const isEdit = id > 0;
  return (
    <View style={style}>
      {isEdit ? (
        <View style={{ paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.sm, width: '100%', ...currentShadow }}>
         <ScrollView
          horizontal
          nestedScrollEnabled 
          directionalLockEnabled 
           contentContainerStyle={{   gap: spacing.sm,}}
        >
          {steps.map((step, index) => {
            const isActive = step.step === activeStep;
            const isDisabled = !!step.disabled;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                disabled={isDisabled}
                onPress={() => {
                  if (!isDisabled) {
                    step.onClick?.();
                  }
                }}
                style={{
                  flexDirection: rowDirection,
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: isActive ? colors.background : colors.surface,
                  opacity: isDisabled ? 0.6 : 1,
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  ...currentShadow,
                }}
              >
                {step.icon ? (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.isValidElement(step.icon)
                      ? React.cloneElement(step.icon, { color: isActive ? colors.primary : colors.text, size: iconSize.md })
                      : step.icon}
                  </View>
                ) : null}

                <TranslationText
                  page={step.ResourcePage || ResourcePage}
                  title={step.title}
                  style={stylesText({ color: isActive ? 'primary' : 'title', size: 'md', weight: 'semiBold' })}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView> 
        </View>
        
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: rowDirection, alignItems: 'flex-start' }}
        >
          {steps.map((step, index) => {
            const isActive = step.step <= activeStep;
            const isDisabled = !!step.disabled;

            return (
              <Fragment key={index}>
                <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.xs, opacity: isDisabled ? 0.6 : 1 }}>
                  <View
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                      borderRadius: radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.surface,
                      borderWidth: isActive ? 1.5 : 0,
                      borderColor: colors.primary,
                      ...(isActive ? null : currentShadow),
                    }}
                  >
                    {React.isValidElement(step.icon)
                      ? React.cloneElement(step.icon, { color: isActive ? colors.primary : colors.text, size: iconSize.md })
                      : step.icon}
                  </View>

                  <TranslationText
                    page={step.ResourcePage || ResourcePage}
                    title={step.title}
                    style={stylesText({ color: isActive ? 'primary' : 'text', size: 'md', weight: isActive ? 'bold' : 'regular' })}
                  />
                </View>

                {index < steps.length - 1 && (
                  <View
                    style={{
                      width: 32,
                      height: 1,
                      marginTop: CIRCLE_SIZE / 2,
                      marginHorizontal: spacing.xs,
                      backgroundColor: colors.border,
                    }}
                  />
                )}
              </Fragment>
            );
          })}
        </ScrollView>
      )}

      <View style={{ marginTop: spacing.md }}>
        {Children.toArray(children).find((child) => child?.props?.step === activeStep) ?? null}
      </View>
    </View>
  );
}

/**
 * Step — used as a child of Stepper to define step-specific content.
 * `step` is read directly off this element's props by the parent Stepper.
 */
export function Step({ children }) {
  return <>{children}</>;
}
