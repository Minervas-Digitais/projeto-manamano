/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  ConfigNotificationContainer,
  NotificationInfoContainer,
  NotificationInfoText,
  NotificationBodyContainer,
} from './NotificationStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NoNotification from '../../assets/no-notification-icon.svg';

export default function Notification({ navigation }: any) {
  const duckPhoto = require('../../assets/duck.png');
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    const loggedId = storage.getString('loggedId');
    if (loggedId) {
      api.get(`notifications/user/${loggedId}`).then((res) => setNotification(res.data));
    }
    storage.delete('body');
  }, []);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const onPressActions = (body: string, id: string, type: string) => {
    storage.set('body', body);
    api.patch(`notifications/${id}`, {
      isRead: true,
    });
    if (type !== 'COMMENT') {
      navigation.navigate('NotificationPage');
    }
  };

  return (
    <ConfigNotificationContainer>
      <HeaderCustom font="inter-bold" text="Notificações" />
      <NotificationBodyContainer>
        <NotificationInfoContainer>
          {notification?.length > 0 ? (
            notification?.map((item: any) => (
              <NotificationCard
                user={item.senderName}
                group={item.groupName}
                image={duckPhoto}
                onPress={() => {
                  onPressActions(item.body, item.id, item.type);
                }}
                type={item.type}
                body={item.body}
                date={item.createdAt}
              />
            ))
          ) : (
            <>
              <NoNotification />
              <NotificationInfoText font="inter-bold">
                Você não possui notificações no momento
              </NotificationInfoText>
            </>
          )}
        </NotificationInfoContainer>
        {notification?.length > 0 ? (
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
