/* eslint-disable global-require */
import React from 'react';
import { Image, View } from 'react-native';
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
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import BackButton from '../../components/BackButton/BackButton';

export default function Notification() {
  const noNotification = require('../../assets/no-notification-icon.svg');
  const duckPhoto = require('../../assets/duck.png');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const fakeNotification: any = [
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
    { user: 'MariaJoaquina', group: 'Veteranos 24.1', date: 'Ontem, 21:43', image: duckPhoto },
  ];

  return (
    <ConfigNotificationContainer>
      <ConfigNotificationHeaderContainer>
        <BackButton />
        <ConfigNotificationTitle font="inter-bold">Notificações</ConfigNotificationTitle>
        <View />
      </ConfigNotificationHeaderContainer>

      <NotificationBodyContainer>
        <NotificationInfoContainer>
          {fakeNotification?.length > 0 ? (
            fakeNotification?.map((item: any) => (
              <NotificationCard
                user={item.user}
                group={item.group}
                date={item.date}
                image={item.image}
                onPress={() => {}}
              />
            ))
          ) : (
            <>
              <Image source={noNotification} />
              <NotificationInfoText font="inter-bold">
                Você não possui notificações no momento
              </NotificationInfoText>
            </>
          )}
        </NotificationInfoContainer>
        {fakeNotification?.length > 0 ? (
          <View />
        ) : (
          <ButtonCustom
            onPress={() => {}}
            backColor="#EF4036"
            fontColor="#ffff"
            text="Retornar para a tela inicial"
            border={false}
          />
        )}
      </NotificationBodyContainer>
    </ConfigNotificationContainer>
  );
}
