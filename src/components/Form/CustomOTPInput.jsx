import React, { useRef, useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import TranslationText from '../TranslationText';

/**
 * CustomOTPInput — fixed-length OTP code input rendered as separate digit boxes.
 * onChange(value, name) — receives the joined code string and the field name.
 */
export default function CustomOTPInput({
  label,
  value = '',
  onChange,
  onComplete,
  touched,
  errors,
  disabled = false,
  Required = false,
  name,
  ResourcePage = '',
  length = 6,
  style,
  boxStyle,
}) {
  const { colors, spacing, text, radius,rf, shadows, fonts, rowDirection, writingDirection, globalStyles } = useDesignSystem();
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [rowWidth, setRowWidth] = useState(0);
  const inputs = useRef([]);

  const boxGap = spacing.md;  
  const boxSize = rowWidth ? (rowWidth - boxGap * (length - 1)) / length : 0;

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setCode = (next) => {
    if (!onChange) return;
    onChange(next, name);
    if (next.length === length && onComplete) onComplete(next);
  };

  const handleChangeText = (text, index) => {
    if (disabled) return;
    const digit = text.replace(/\D/g, '').slice(-1);

    const chars = value.split('');
    if (digit) {
      chars[index] = digit;
      setCode(chars.join('').slice(0, length));
      if (index < length - 1) inputs.current[index + 1]?.focus();
    } else {
      chars[index] = '';
      setCode(chars.join(''));
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (disabled) return;
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const chars = value.split('');
      chars[index - 1] = '';
      setCode(chars.join(''));
      inputs.current[index - 1]?.focus();
    }
  };

  const container = {
    marginBottom: spacing.base,
  };

  const labelRow = {
    flexDirection: rowDirection,
    alignItems: 'center',
    marginBottom: spacing.sm,
  };

  const boxesRow = {
    flexDirection: rowDirection,
    justifyContent: 'space-between',
  };

  const getBoxStyle = (index) => {
    const isFocused = focusedIndex === index;
    const borderColor =
      touched && errors ? colors.error : isFocused ? colors.primary : colors.border;

    return {
      width: boxSize,
      height: rf(48),
      borderWidth: 1,
      borderColor: disabled ? colors.disabled : borderColor,
      borderRadius: radius.md,
      backgroundColor: disabled ? colors.disabled : colors.surface,
      ...shadows.light,
      fontSize: text.lg,
      fontFamily: fonts.medium,
      color: disabled ? colors.disabledText : colors.title,
      textAlign: 'center',
    };
  };

  return (
    <View style={[container, style]}>
      {label && (
        <View style={labelRow}>
          <TranslationText title={label} page={ResourcePage} style={[globalStyles.labelTxt]} />
          {Required && (
            <Text style={{ color: colors.primary, fontFamily: fonts.medium }}> *</Text>
          )}
        </View>
      )}

      <View style={boxesRow} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[getBoxStyle(index), boxStyle]}
            value={digit}
            placeholder="●"
            placeholderTextColor={colors.placeholder}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => !disabled && setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            editable={!disabled}
            keyboardType="numeric"
            maxLength={1}
            writingDirection={writingDirection}
          />
        ))}
      </View>

      {touched && errors && (
        <TranslationText title={errors} page={ResourcePage} style={globalStyles.errorTxt} />
      )}
    </View>
  );
}
