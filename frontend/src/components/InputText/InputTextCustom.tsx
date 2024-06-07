/* eslint-disable global-require */
import React, { useState } from 'react';
import { TextInputMask } from 'react-native-masked-text';
import { StyleSheet } from 'react-native';
import {
  InputText,
  InputTextContainer,
  InputTextIcon,
  InputTextIconContainer,
  InputTextIconInputContainer,
  LabelInputText,
} from './InputTextCustomStyle';

export default function InputTextCustom({
  onChangeText,
  label,
  imageIcon,
  isPassword,
  value,
  type,
}: any) {
  const [eyeIcon, setEyeIcon] = useState(true);
  const IconEyeOpen = require('../../assets/eye-open-icon.svg');
  const IconEyeClosed = require('../../assets/eye-closed-icon.svg');

  return (
    <InputTextContainer>
      <LabelInputText>{label}</LabelInputText>
      <InputTextIconInputContainer>
        <InputTextIcon source={imageIcon} />

        {type !== undefined ? (
          <TextInputMask
            type={type}
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
          />
        ) : (
          <InputText
            onChangeText={onChangeText}
            value={value}
            secureTextEntry={eyeIcon && isPassword}
          />
        )}

        <InputTextIconContainer onPress={() => setEyeIcon(!eyeIcon)} isPassword={isPassword}>
          <InputTextIcon source={eyeIcon ? IconEyeClosed : IconEyeOpen} />
        </InputTextIconContainer>
      </InputTextIconInputContainer>
    </InputTextContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 35,
    backgroundColor: 'transparent',
    borderRadius: 5,
    padding: 5,
    color: '#5e6366',
    outlineStyle: 'none',
  },
});
