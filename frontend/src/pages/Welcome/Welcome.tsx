/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import { StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as Application from 'expo-application';
import {
  ButtomContainer,
  LogoSVG,
  ManamanoPattern,
  PatternWrapper,
  RectContainer,
  WelcomeContainer,
} from './WelcomeStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import secureStorage from '../../services/secureStorage';
import api from '../../services/api';

export default function WelcomeScreen({ navigation }: any) {
  useEffect(() => {
    async function checkAppVersion() {
      const build = Number(Application.nativeBuildVersion);

      const res = await api.get(`http://localhost:3000/version/check?build=${build}`);

      if (res.data.update) {
        console.log('Tem que atualizar');
      }
    }

    const checkAuth = async () => {
      const accessToken = await secureStorage.getItem('accessToken');
      const loggedId = await secureStorage.getItem('loggedId');
      if (loggedId && accessToken) {
        navigation.navigate('Home');
      }
    };

    checkAppVersion();
    checkAuth();
  }, [navigation]);

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
