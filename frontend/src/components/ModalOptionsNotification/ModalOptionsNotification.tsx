/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  ModalOptionsNotificationContainer,
  ModalOptionsNotificationInfo,
  ModalOptionsNotificationText,
} from './ModalOptionsNotificationStyle';
import api from '../../services/api';
import localStorage from '../../services/localStorage';
import DeleteConfirmation from '../DeleteAllConfirmation/DeleteAllConfirmation';
import CheckRead from '../../assets/check-read-icon.svg';
import Trash from '../../assets/trash-red-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/auth/useAuth';

export default function ModalOptionsNotification({
  type,
  display,
  id,
  height,
  style,
  admin,
  body,
}: any) {
  const [displayConfirm, setDisplayConfirm] = useState(display ?? false);
  const [displayDelete, setDisplayDelete] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { accessToken, loggedId } = useAuth();

  useEffect(() => {
    setDisplayConfirm(display);
  }, [display]);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const optionsMarkAsRead = async () => {
    if (!accessToken) return;

    if (type === 'header' && loggedId && !admin) {
      api
        .patch(
          'notifications/user/',
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )
        .then((res) => console.log(JSON.stringify(res.data)))
        .catch((err) => console.log('Erro ao atualizar as notificações:', err));
    } else if (type === 'header' && admin) {
      navigation.navigate('GlobalNotification', { id });
      setDisplayConfirm(false);
    } else if (type === 'WARNING' && admin) {
      navigation.navigate('GlobalNotification', { id, body });
      setDisplayConfirm(false);
    } else {
      api
        .patch(
          `notifications/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )
        .then((res) => console.log(JSON.stringify(res.data)))
        .catch((err) => console.log('Erro ao atualizar a notificação:', err));
      setDisplayConfirm(false);
    }
  };
  const optionsActions = () => {
    if (type !== 'header' && !admin) {
      localStorage.set('idNotif', id);
      localStorage.set('displayNotif', true);
      setDisplayConfirm(false);
    }

    if (type !== 'header' && admin) {
      if (!accessToken) return;

      api
        .delete(`notifications/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(() => {
          setDisplayConfirm(false);
          Toast.show({
            type: 'success',
            text1: 'Notificação excluída com sucesso!',
          });
        })
        .catch((err) => {
          console.error('Erro ao deletar notificação:', err);
          Toast.show({
            type: 'error',
            text1: 'Erro ao excluir notificação.',
            text2: 'Tente novamente mais tarde.',
          });
        });
    }

    if (type === 'header') {
      setDisplayDelete(!displayDelete);
    }
  };

  const modalContainerProps = {
    display: displayConfirm,
    height,
    style,
    type,
    admin,
  };

  return (
    <>
      <DeleteConfirmation
        text="Tem certeza que deseja excluir todas as notificações?"
        display={displayDelete}
      />
      <ModalOptionsNotificationContainer {...modalContainerProps}>
        {!(admin && type === 'header') && (
          <ModalOptionsNotificationInfo onPress={optionsActions} testID={`delete-button-${id}`}>
            <Trash />
            <ModalOptionsNotificationText color="red" font="inter-regular">
              {type === 'header'
                ? 'Excluir todas'
                : type === 'WARNING'
                  ? 'Excluir Comunicado'
                  : 'Excluir'}
            </ModalOptionsNotificationText>
          </ModalOptionsNotificationInfo>
        )}
        <ModalOptionsNotificationInfo onPress={optionsMarkAsRead}>
          <CheckRead />
          <ModalOptionsNotificationText color="#515151" font="inter-regular">
            {type === 'header'
              ? admin
                ? 'Criar Comunicado'
                : 'Marcar todas como lidas'
              : type === 'WARNING'
                ? 'Editar Comunicado'
                : 'Marcar como lida'}
          </ModalOptionsNotificationText>
        </ModalOptionsNotificationInfo>
      </ModalOptionsNotificationContainer>
    </>
  );
}
