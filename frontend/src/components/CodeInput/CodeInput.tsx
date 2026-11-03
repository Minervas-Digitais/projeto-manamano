import React, { useRef } from 'react';
import { TextInput, TouchableWithoutFeedback, View } from 'react-native';
import styled from 'styled-components/native';

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  testID?: string;
};

const HiddenInput = styled.TextInput`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
`;

const BoxesContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-vertical: 10px;
`;

const Box = styled.View<{ isFocused: boolean; hasValue: boolean }>`
  width: 48px;
  height: 56px;
  border-width: 2px;
  border-color: ${(prop) => (prop.isFocused ? '#160E47' : '#5E6366')};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const BoxText = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: #160e47;
`;

export default function CodeInput({ value, onChange, length = 6, testID }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);

  const cleanDigits = (text: string) => {
    const onlyDigits = text.replace(/\D/g, '').slice(0, length);
    onChange(onlyDigits);
  };

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  const chars = value.split('');

  return (
    <TouchableWithoutFeedback onPress={handleBoxPress} accessibilityRole="none">
      <View style={{ width: '100%' }}>
        <HiddenInput
          ref={inputRef}
          value={value}
          onChangeText={cleanDigits}
          maxLength={length}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus
          testID={testID || 'code-hidden-input'}
          accessibilityLabel="Código de verificação de 6 dígitos"
        />
        <BoxesContainer testID="code-boxes-container">
          {Array.from({ length }).map((_, index) => {
            const char = chars[index] || '';
            const isCurrent =
              index === value.length || (index === length - 1 && value.length === length);
            return (
              <Box
                key={index}
                isFocused={isCurrent}
                hasValue={Boolean(char)}
                testID={`code-box-${index}`}>
                <BoxText>{char}</BoxText>
              </Box>
            );
          })}
        </BoxesContainer>
      </View>
    </TouchableWithoutFeedback>
  );
}
