/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  ModalOptionsNotificationContainer,
  ModalOptionsNotificationInfo,
  ModalOptionsNotificationText,
} from './ModalOptionsNotificationStyle';
import api from '../../services/api';
import { storage } from '../../pages/SignIn/SignIn';
import DeleteConfirmation from '../DeleteAllConfirmation/DeleteAllConfirmation';

export default function ModalOptionsNotification({ type, display, id, height, style }: any) {
  const checkRead = require('../../assets/check-read-icon.svg');
  const trash = require('../../assets/trash-red-icon.svg');

  const [displayConfirm, setDisplayConfirm] = useState(display ?? false);
  const [displayDelete, setDisplayDelete] = useState(false);

  useEffect(() => {
    setDisplayConfirm(display);
  }, [display]);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const optionsMarkAsRead = () => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (type === 'header' && loggedId && accessToken) {
      api
        .patch(
          `notifications/user/${loggedId}`,
          { isRead: true },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((res) => console.log(JSON.stringify(res.data)))
        .catch((err) => console.log('Erro ao atualizar a notificação:', err));
    } else {
      api
        .patch(
          `notifications/${id}`,
          { isRead: true },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((res) => console.log(JSON.stringify(res.data)))
        .catch((err) => console.log('Erro ao atualizar a notificação:', err));
      setDisplayConfirm(false);
    }
  };

  const optionsActions = () => {
    if (type !== 'header') {
      storage.set('idNotif', id);
      storage.set('displayNotif', true);
      setDisplayConfirm(false);
    }
    if (type === 'header') {
      setDisplayDelete(!displayDelete);
    }
  };

  return (
    <>
      <DeleteConfirmation
        text="Tem certeza que deseja excluir todas as notificações?"
        display={displayDelete}
        id={id}
        onPress={() => {}}
      />
      <ModalOptionsNotificationContainer display={displayConfirm} height={height} style={style}>
        <ModalOptionsNotificationInfo onPress={optionsActions}>
          <Image source={trash} />
          <ModalOptionsNotificationText color="red" font="inter-regular">
            {type === 'header' ? 'Excluir todas' : 'Excluir'}
          </ModalOptionsNotificationText>
        </ModalOptionsNotificationInfo>
        <ModalOptionsNotificationInfo onPress={optionsMarkAsRead}>
          <Image source={checkRead} />
          <ModalOptionsNotificationText color="#515151" font="inter-regular">
            {type === 'header' ? 'Marcar todas como lidas' : 'Marcar como lida'}
          </ModalOptionsNotificationText>
        </ModalOptionsNotificationInfo>
      </ModalOptionsNotificationContainer>
    </>
  );
}
