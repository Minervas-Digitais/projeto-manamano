/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import { ActivityIndicator, StatusBar, View } from 'react-native';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as Application from 'expo-application';
import Toast from 'react-native-toast-message';
import {
  ButtomContainer,
  LogoSVG,
  ManamanoPattern,
  PatternWrapper,
  RectContainer,
  WelcomeContainer,
} from './WelcomeStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { useAuth } from '../../context/auth/useAuth';
import api from '../../services/api';

export default function WelcomeScreen({ navigation }: any) {
  const { isLoading, loggedId } = useAuth();

  useEffect(() => {
    async function checkAppVersion() {
      try {
        const build = Number(Application.nativeBuildVersion);

        const res = await api.get(`/version/check?build=${build}`);

        if (res.data.update) {
          Toast.show({
            type: 'warning',
            text1: 'Nova versão disponível',
            text2: 'Atualize o aplicativo para continuar recebendo novidades.',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível verificar a versão',
        });
      }
    }

    const checkAuth = async () => {
      if (loggedId) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    };

    checkAppVersion();
    checkAuth();
  }, [navigation, loggedId]);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded || isLoading) {
    // trocar por uma splash screen depois
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF4036" />
      </View>
    );
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
