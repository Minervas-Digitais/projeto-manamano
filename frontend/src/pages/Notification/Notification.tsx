/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { Image, TouchableOpacity, View } from 'react-native';
=======
import { Image } from 'react-native';
>>>>>>> Stashed changes
=======
import { Image } from 'react-native';
>>>>>>> Stashed changes
=======
import { Image } from 'react-native';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
import DeleteConfirmation from '../../components/DeleteConfirmation/DeleteConfirmation';
=======
import DotsMenuIcon from '../../assets/dotsMenuBig.svg';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NoNotification from '../../assets/no-notification-icon.svg';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

export default function Notification({ navigation }: any) {
  const duckPhoto = require('../../assets/duck.png');
  const dotsMenuIcon = require('../../assets/dotsMenuBig.svg');

  const [notification, setNotification] = useState([]);
  const [display, setDisplay] = useState(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const [accessTokenState, setAccessTokenState] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const [loggedIdState, setLoggedIdState] = useState('');
  const [admin, setAdmin] = useState(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const fetchNotifications = useCallback(() => {
    const loggedId = storage.getString('loggedId');
    const accessToken = storage.getString('accessToken');
    if (loggedId && accessToken) {
<<<<<<< Updated upstream
=======
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(`/user/${loggedIdState}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setUserInfo(response.data);
        if (userInfo.sysRole === 'ADMIN') {
          setAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
      }
    };

    if (loggedIdState && accessTokenState) {
      fetchUserInfo();
    }
  }, [loggedIdState, accessTokenState, userInfo.sysRole]);
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <ModalOptionsNotification display={display} type="header" style={{ top: 60 }} height={80} />
        <ConfigNotificationHeaderContainer>
          <BackButton />
          <ConfigNotificationTitle font="inter-bold">Notificações</ConfigNotificationTitle>
          <TouchableOpacity onPress={() => setDisplay(!display)}>
            <Image source={dotsMenuIcon} />
          </TouchableOpacity>
        </ConfigNotificationHeaderContainer>
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <HeaderCustom
          icon
          headerButton={<DotsMenuIcon />}
          text={admin ? 'Comunicados' : 'Notificação'}
          font="inter-bold"
          onPress={() => setDisplay(!display)}
        />
        <ModalOptionsNotification
          display={display}
          type="header"
          style={{ top: 60, zIndex: 11 }}
          height="80px"
          admin={admin}
        />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
                  admin={admin}
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
