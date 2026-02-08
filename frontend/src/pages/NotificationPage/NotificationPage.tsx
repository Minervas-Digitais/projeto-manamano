/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { NotificationPageContainer } from './NotificationPageStyle';
import {
  NotificationTextContainerWarning,
  NotificationTextGreyWarning,
  NotificationTextRed,
} from '../../components/NotificationCard/NotificationCardStyle';
import localStorage from '../../services/localStorage';
import MegaPhone from '../../assets/megaphone-icon.svg';

export default function NotificationPage() {
  useEffect(() => {
    const content = localStorage.getString('body');
    if (content) {
      setBody(content);
    }
  }, []);

  const [body, setBody] = useState('Erro ao carregar o conteúdo');

  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <>
      <HeaderCustom font="inter-bold" text="Notificação" onPress={() => {}} />

      <NotificationPageContainer>
        <View>
          <NotificationTextContainerWarning height="min-content" style={{}}>
            <MegaPhone />
            <NotificationTextRed font="inter-bold">Comunicado: </NotificationTextRed>
          </NotificationTextContainerWarning>
          <NotificationTextContainerWarning height={39}>
            <NotificationTextGreyWarning font="inter-semiBold">{body}</NotificationTextGreyWarning>
          </NotificationTextContainerWarning>
        </View>
      </NotificationPageContainer>
    </>
  );
}
