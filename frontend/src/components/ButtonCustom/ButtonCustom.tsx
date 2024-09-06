/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Image } from 'react-native';
import { ButtonContainer, ButtonText } from './ButtonStyle';

export default function ButtonCustom({
  backColor,
  fontColor,
  text,
  onPress,
  border,
  leftIcon,
  rightIcon,
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ButtonContainer backgroundColor={backColor} onPress={onPress} border={border}>
      <Image source={leftIcon} />
      <ButtonText fontColor={fontColor} fontFamily="inter-bold">
        {text}
      </ButtonText>
      <Image source={rightIcon} />
    </ButtonContainer>
  );
}
