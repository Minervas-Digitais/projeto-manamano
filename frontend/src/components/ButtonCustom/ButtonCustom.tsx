/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { ButtonContainer, ButtonText } from './ButtonStyle';

export default function ButtonCustom({ backColor, fontColor, text, onPress }: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ButtonContainer backgroundColor={backColor} onPress={onPress}>
      <ButtonText fontColor={fontColor} fontFamily="inter-bold">
        {text}
      </ButtonText>
    </ButtonContainer>
  );
}
