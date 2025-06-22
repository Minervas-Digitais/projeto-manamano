/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-native';
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
import DotsMenuIcon from '../../assets/dotsMenuBig.svg';
import DeleteConfirmation from '../../components/DeleteAllConfirmation/DeleteAllConfirmation';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NoNotification from '../../assets/no-notification-icon.svg';

export default function Notification({ navigation }: any) {
  const duckPhoto = require('../../assets/duck.png');

  const [notification, setNotification] = useState([]);
  const [display, setDisplay] = useState(false);
  const [accessTokenState, setAccessTokenState] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const [loggedIdState, setLoggedIdState] = useState('');
  const [admin, setAdmin] = useState(false);

  const fetchNotifications = useCallback(() => {
    const loggedId = storage.getString('loggedId');
    const accessToken = storage.getString('accessToken');
    if (loggedId && accessToken) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
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

  const onPressActions = (body: string, id: string, type: string, idContent?: string) => {
    storage.set('body', body);
    setNotification((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    );
    api
      .patch(
        `notifications/${id}`,
        { isRead: true },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      )
      .then((res) => console.log(JSON.stringify(res.data)))
      .catch((err) => console.log('Erro ao atualizar a notificação:', err));

    if (type === 'WARNING') {
      navigation.navigate('NotificationPage');
    }
    if (type !== 'WARNING') {
      navigation.navigate('Post', { postId: idContent });
    }
  };

  return (
    <>
      <DeleteOneConfirmation
        text="Tem certeza que deseja excluir a notificação?"
        onPress={() => {}}
      />

      <ConfigNotificationContainer>
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
        <NotificationBodyContainer>
          <NotificationInfoContainer>
            {notification?.length > 0 ? (
              notification.map((item: any) => (
                <NotificationCard
                  key={item.id}
                  user={item.senderName}
                  group={item.groupName}
                  image={duckPhoto}
                  onPress={() => onPressActions(item.body, item.id, item.type, item.idContent)}
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
