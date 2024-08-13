/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { ButtonContainer, ButtonText } from './ButtonStyle';

export default function ButtonCustom({ backColor, fontColor, text, onPress, border }: any) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ButtonContainer backgroundColor={backColor} onPress={onPress} border={border}>
      <ButtonText fontColor={fontColor} fontFamily="inter-semiBold">
        {text}
      </ButtonText>
    </ButtonContainer>
  );
}
