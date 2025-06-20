/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useFocusEffect } from '@react-navigation/native';
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
import ModalOptionsNotification from '../../components/ModalOptionsNotification/ModalOptionsNotification';
import DeleteConfirmation from '../../components/DeleteConfirmation/DeleteConfirmation';
import DotsMenuIcon from '../../assets/dotsMenuBig.svg';

export default function Notification({ navigation }: any) {
  const duckPhoto = require('../../assets/duck.png');

  const [notification, setNotification] = useState([]);
  const [display, setDisplay] = useState(false);

  const fetchNotifications = useCallback(() => {
    const loggedId = storage.getString('loggedId');
    const accessToken = storage.getString('accessToken');

    if (loggedId && accessToken) {
      api
        .get(`notifications/user/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => setNotification(res.data))
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      storage.delete('body');
      storage.delete('displayNotif');
    }, [fetchNotifications]),
  );

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) return null;

  const onPressActions = (body: string, id: string, type: string) => {
    storage.set('body', body);
    setNotification((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    );
    api.patch(`notifications/${id}`, { isRead: true });

    if (type !== 'COMMENT') {
      navigation.navigate('NotificationPage');
    }
  };

  const onPressDeleteConfirm = (id: any) => {};

  return (
    <>
      <DeleteConfirmation
        text="Tem certeza que deseja excluir as notificações?"
        onPress={() => {}}
      />

      <ConfigNotificationContainer>
        <ModalOptionsNotification display={display} type="header" style={{ top: 60 }} height={80} />
        <ConfigNotificationHeaderContainer>
          <BackButton />
          <ConfigNotificationTitle font="inter-bold">Notificações</ConfigNotificationTitle>
          <TouchableOpacity onPress={() => setDisplay(!display)}>
            <DotsMenuIcon />
          </TouchableOpacity>
        </ConfigNotificationHeaderContainer>
        <NotificationBodyContainer>
          <NotificationInfoContainer>
            {notification?.length > 0 ? (
              notification.map((item: any) => (
                <NotificationCard
                  key={item.id}
                  user={item.senderName}
                  group={item.groupName}
                  image={duckPhoto}
                  onPress={() => onPressActions(item.body, item.id, item.type)}
                  type={item.type}
                  body={item.body}
                  date={item.createdAt}
                  isread={item.isRead}
                  idNotif={item.id}
                  confirm={false}
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
          {notification?.length === 0 && (
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
    </>
  );
}
