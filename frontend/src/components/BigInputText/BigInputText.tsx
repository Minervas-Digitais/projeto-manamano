/* eslint-disable global-require */
import React from 'react';
import { TextInputMask } from 'react-native-masked-text';
import { StyleSheet } from 'react-native';
import { LabelInputText } from '../InputText/InputTextCustomStyle';
import {
  BigInputText,
  BigInputTextContainer,
  BigInputTextIconInputContainer,
} from './BigInputTextStyle';

export default function BigInputTextCustom({ onChangeText, label, value, type, options }: any) {
  return (
    <BigInputTextContainer>
      <LabelInputText>{label}</LabelInputText>
      <BigInputTextIconInputContainer>
        {type !== undefined ? (
          <TextInputMask
            type={type}
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            options={options}
          />
        ) : (
          <BigInputText multiline onChangeText={onChangeText} value={value} />
        )}
      </BigInputTextIconInputContainer>
    </BigInputTextContainer>
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
