/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Image } from 'react-native';
import { ADMButtonContainer, ADMButtonGradient, ADMButtonText } from './ADMPageButtonStyle';

export default function ADMPageButton({ fontColor, text, onPress, border, icon }: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ADMButtonContainer onPress={onPress} border={border}>
      <ADMButtonGradient>
        <Image source={icon} />
        <ADMButtonText fontColor={fontColor} fontFamily="inter-bold">
          {text}
        </ADMButtonText>
      </ADMButtonGradient>
    </ADMButtonContainer>
  );
}
