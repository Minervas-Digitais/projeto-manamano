/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
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
  const [pendingAction, setPendingAction] = useState<'markRead' | 'delete' | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { loggedId } = useAuth();

  useEffect(() => {
    setDisplayConfirm(display);
  }, [display]);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const optionsMarkAsRead = async () => {
    if (!loggedId || pendingAction) return;

    if (type === 'header' && loggedId && !admin) {
      setPendingAction('markRead');
      try {
        await api.patch('notifications/user/');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar as notificações',
          text2: 'Não foi possível marcar todas as notificações como lidas. Tente novamente.',
        });
      } finally {
        setPendingAction(null);
      }
    } else if (type === 'header' && admin) {
      navigation.navigate('GlobalNotification', { id });
      setDisplayConfirm(false);
    } else if (type === 'WARNING' && admin) {
      navigation.navigate('GlobalNotification', { id, body });
      setDisplayConfirm(false);
    } else {
      setPendingAction('markRead');
      try {
        await api.patch(`notifications/${id}`);
        setDisplayConfirm(false);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar notificação',
          text2: 'Não foi possível atualizar a notificação. Tente novamente.',
        });
      } finally {
        setPendingAction(null);
      }
    }
  };

  const optionsActions = async () => {
    if (pendingAction) return;

    if (type !== 'header' && !admin) {
      localStorage.set('idNotif', id);
      localStorage.set('displayNotif', true);
      setDisplayConfirm(false);
    }

    if (type !== 'header' && admin) {
      if (!loggedId) return;

      setPendingAction('delete');
      try {
        await api.delete(`notifications/${id}`);
        setDisplayConfirm(false);
        Toast.show({
          type: 'success',
          text1: 'Notificação excluída com sucesso!',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao excluir notificação.',
          text2: 'Tente novamente mais tarde.',
        });
      } finally {
        setPendingAction(null);
      }
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
          <ModalOptionsNotificationInfo
            onPress={optionsActions}
            testID={`delete-button-${id}`}
            disabled={!!pendingAction}
            accessibilityState={{ disabled: !!pendingAction, busy: pendingAction === 'delete' }}>
            {pendingAction === 'delete' ? (
              <ActivityIndicator size="small" color="#EF4036" />
            ) : (
              <Trash />
            )}
            <ModalOptionsNotificationText color="red" font="inter-regular">
              {type === 'header'
                ? 'Excluir todas'
                : type === 'WARNING'
                  ? 'Excluir Comunicado'
                  : 'Excluir'}
            </ModalOptionsNotificationText>
          </ModalOptionsNotificationInfo>
        )}
        <ModalOptionsNotificationInfo
          onPress={optionsMarkAsRead}
          disabled={!!pendingAction}
          accessibilityState={{ disabled: !!pendingAction, busy: pendingAction === 'markRead' }}>
          {pendingAction === 'markRead' ? (
            <ActivityIndicator size="small" color="#515151" />
          ) : (
            <CheckRead />
          )}
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
