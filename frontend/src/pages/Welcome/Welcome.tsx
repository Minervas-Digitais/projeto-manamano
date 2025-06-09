/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import { StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  ButtomContainer,
  LogoSVG,
  ManamanoPattern,
  PatternWrapper,
  RectContainer,
  WelcomeContainer,
} from './WelcomeStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { storage } from '../SignIn/SignIn';

export default function WelcomeScreen({ navigation }: any) {
  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (loggedId && accessToken) {
      navigation.navigate('Home');
    }
  }, []);
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <WelcomeContainer>
      <StatusBar translucent backgroundColor="transparent" />
      <PatternWrapper>
        <ManamanoPattern />
      </PatternWrapper>
      <RectContainer>
        <LogoSVG />
        <ButtomContainer>
          <ButtonCustom
            onPress={() => navigation.navigate('SignUp')}
            backColor="#160E47"
            fontColor="#FFF"
            text="Cadastre-se"
            border
          />
          <ButtonCustom
            onPress={() => navigation.navigate('SignIn')}
            backColor="transparent"
            fontColor="#160E47"
            text="Entrar"
            border
          />
        </ButtomContainer>
      </RectContainer>
    </WelcomeContainer>
  );
}
