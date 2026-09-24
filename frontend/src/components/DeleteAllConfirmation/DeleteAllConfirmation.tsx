/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import {
  DeleteConfirmationButton,
  DeleteConfirmationButtonContainer,
  DeleteConfirmationCardContainer,
  DeleteConfirmationContainer,
} from './DeleteAllConfirmationStyle';
import { ModalOptionsNotificationText } from '../ModalOptionsNotification/ModalOptionsNotificationStyle';
import localStorage from '../../services/localStorage';
import api from '../../services/api';
import { useAuth } from '../../context/auth/useAuth';

export default function DeleteConfirmation({ text, display }: any) {
  const [shouldDisplay, setShouldDisplay] = useState(display);
  const { loggedId } = useAuth();

  useEffect(() => {
    setShouldDisplay(display);
  }, [display]);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const optionsDelete = async () => {
    if (!loggedId) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao deletar todas as notificações: token ausente'
      });
      return;
    }

    try {
      await api.delete('/notifications/user');
      localStorage.delete('displayNotif');
      localStorage.delete('header');
      setShouldDisplay(false);
      Toast.show({
        type: 'success',
        text1: 'Notificações excluídas',
        text2: 'Todas as notificações foram excluídas com sucesso.',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir notificações',
        text2: 'Não foi possível excluir todas as notificações. Tente novamente.',
      });
    }
  };

  const handleCancel = () => {
    localStorage.delete('displayNotif');
    setShouldDisplay(false);
  };

  if (!fontsLoaded) return null;

  return (
    <DeleteConfirmationContainer display={shouldDisplay}>
      <DeleteConfirmationCardContainer>
        <View>
          <ModalOptionsNotificationText font="inter-regular" color="#515151">
            {text}
          </ModalOptionsNotificationText>
        </View>

        <DeleteConfirmationButtonContainer>
          <DeleteConfirmationButton onPress={optionsDelete}>
            <ModalOptionsNotificationText font="inter-regular" color="#EF4036">
              Excluir
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
          <DeleteConfirmationButton onPress={handleCancel}>
            <ModalOptionsNotificationText font="inter-regular" color="#515151">
              Cancelar
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
        </DeleteConfirmationButtonContainer>
      </DeleteConfirmationCardContainer>
    </DeleteConfirmationContainer>
  );
}
