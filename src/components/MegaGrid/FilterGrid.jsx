import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { MegaGridContext } from './MegaGridContext';
import PopupModalSlide from '../PopupModalSlide';
import TranslationText from '../TranslationText';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { IconFilter } from '../../assets/IconsSvg';

export default function FilterGrid({ isVisible, setIsVisible }) {
  const { columnState, handleFilterGrid, handleClearFilter, valuesFilter } = useContext(MegaGridContext);
  const { colors, spacing, radius, fonts, stylesText, globalStyles } = useDesignSystem();

  const [values, setValues] = useState({});
  const filterCols = columnState.filterCols || [];

  useEffect(() => {
    if (isVisible && valuesFilter) setValues(valuesFilter);
  }, [isVisible]);

  const set = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const handleApply = () => {
    const nonEmpty = Object.keys(values).filter(k => values[k] !== '' && values[k] != null);
    if (nonEmpty.length === 0) {
      handleClearFilter?.();
    } else {
      handleFilterGrid?.(values, nonEmpty);
    }
    setIsVisible(false);
  };

  const handleClear = () => {
    setValues({});
    handleClearFilter?.();
    setIsVisible(false);
  };

  const inputSty = {
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    height: 44,
    color: colors.title,
    fontFamily: fonts.regular,
    fontSize: 14,
  };

  return (
    <PopupModalSlide
      isVisible={isVisible}
      toggleClick={() => setIsVisible(false)}
      submitClick={handleApply}
      title="filter"
      icon={<IconFilter color={colors.primary} size={20} />}
      ResourcePage="Grid"
      ResourceBtns="Grid"
      titleSubmitBtn="applyFilters"
      titleCancel="clearFilter"
      CancelClick={handleClear}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {filterCols.map(col => (
          <View key={col.key} style={globalStyles.containerFiled}>
            <TranslationText
              title={col.title}
              page={col.ResourcePage || col.generallist || 'Grid'}
              style={[globalStyles.labelTxt, { marginBottom: spacing.xs }]}
            />
            {(col.type === 'date' || col.type === 'dateTime') ? (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TextInput
                  style={[inputSty, { flex: 1 }]}
                  placeholder="From"
                  placeholderTextColor={colors.placeholder}
                  value={values[`${col.key}_from`] || ''}
                  onChangeText={text => set(`${col.key}_from`, text)}
                />
                <TextInput
                  style={[inputSty, { flex: 1 }]}
                  placeholder="To"
                  placeholderTextColor={colors.placeholder}
                  value={values[`${col.key}_to`] || ''}
                  onChangeText={text => set(`${col.key}_to`, text)}
                />
              </View>
            ) : (
              <TextInput
                style={inputSty}
                placeholderTextColor={colors.placeholder}
                value={values[col.key] || ''}
                onChangeText={text => set(col.key, text)}
                keyboardType={col.type === 'number' ? 'numeric' : 'default'}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </PopupModalSlide>
  );
}
