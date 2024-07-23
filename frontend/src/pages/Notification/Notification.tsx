/* eslint-disable global-require */
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  ConfigNotificationContainer,
  ConfigNotificationHeaderContainer,
  ConfigNotificationTitle,
  NotificationInfoContainer,
  NotificationInfoText,
  NotificationBodyContainer,
} from './NotificationStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';

export default function Notification() {
  const backButton = require('../../assets/back-button-icon.svg');
  const noNotification = require('../../assets/no-notification-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <ConfigNotificationContainer>
      <ConfigNotificationHeaderContainer>
        <TouchableOpacity>
          <Image source={backButton} />
        </TouchableOpacity>
        <ConfigNotificationTitle font="inter-bold">Notificações</ConfigNotificationTitle>
        <View />
      </ConfigNotificationHeaderContainer>
      <NotificationBodyContainer>
        <NotificationInfoContainer>
          <Image source={noNotification} />
          <NotificationInfoText font="inter-bold">
            Você não possui notificações no momento
          </NotificationInfoText>
        </NotificationInfoContainer>
        <ButtonCustom
          onPress={() => {}}
          backColor="#EF4036"
          fontColor="#ffff"
          text="Retorne para a tela inicial"
          border={false}
        />
      </NotificationBodyContainer>
    </ConfigNotificationContainer>
  );
}
