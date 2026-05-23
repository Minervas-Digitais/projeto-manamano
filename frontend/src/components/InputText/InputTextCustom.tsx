/* eslint-disable global-require */
import React, { useState } from 'react';
import { TextInputMask } from 'react-native-masked-text';
import { StyleSheet } from 'react-native';
import {
  InputText,
  InputTextContainer,
  InputTextIconContainer,
  InputTextIconInputContainer,
  LabelInputText,
} from './InputTextCustomStyle';
import IconEyeClosed from '../../assets/eye-closed-icon.svg';
import IconEyeOpen from '../../assets/eye-open-icon.svg';

export default function InputTextCustom({
  onChangeText,
  label,
  imageIcon,
  isPassword,
  value,
  type,
  options,
  innerRef,
  testID,
}: any) {
  const [eyeIcon, setEyeIcon] = useState(true);

  return (
    <InputTextContainer>
      <LabelInputText>{label}</LabelInputText>
      <InputTextIconInputContainer>
        {imageIcon}
        {type !== undefined ? (
          <TextInputMask
            type={type}
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            options={options}
            ref={innerRef}
            // ADICIONADO PARA O TESTE
            accessibilityLabel={label}
            testID={testID}
          />
        ) : (
          <InputText
            onChangeText={onChangeText}
            value={value}
            secureTextEntry={eyeIcon && isPassword}
            // ADICIONADO PARA O TESTE
            accessibilityLabel={label}
            testID={testID}
          />
        )}
        <InputTextIconContainer onPress={() => setEyeIcon(!eyeIcon)} isPassword={isPassword}>
          {eyeIcon ? (
            <IconEyeClosed height={15} width={15} />
          ) : (
            <IconEyeOpen height={15} width={15} />
          )}
        </InputTextIconContainer>
      </InputTextIconInputContainer>
    </InputTextContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    width: '100%',
    height: 35,
    backgroundColor: 'transparent',
    borderRadius: 5,
    padding: 5,
    color: '#5e6366',
    // outlineStyle: 'none',
  },
});
