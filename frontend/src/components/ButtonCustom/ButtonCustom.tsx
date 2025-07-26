/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { ButtonContainer, ButtonText } from './ButtonStyle';

export default function ButtonCustom({
  backColor,
  fontColor,
  text,
  onPress,
  border,
  leftIcon,
  rightIcon,
  testID
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ButtonContainer backgroundColor={backColor} onPress={onPress} border={border} testID={testID}>
      {leftIcon}
      <ButtonText accessibilityLabel={text} fontColor={fontColor} fontFamily="inter-bold">
        {text}
      </ButtonText>
      {rightIcon}
    </ButtonContainer>
  );
}
