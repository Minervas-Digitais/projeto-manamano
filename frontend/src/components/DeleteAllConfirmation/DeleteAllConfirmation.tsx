/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  DeleteConfirmationButton,
  DeleteConfirmationButtonContainer,
  DeleteConfirmationCardContainer,
  DeleteConfirmationContainer,
} from './DeleteAllConfirmationStyle';
import { ModalOptionsNotificationText } from '../ModalOptionsNotification/ModalOptionsNotificationStyle';
import secureStorage from '../../services/secureStorage';
import localStorage from '../../services/localStorage';
import api from '../../services/api';

export default function DeleteConfirmation({ text, display }: any) {
  const [shouldDisplay, setShouldDisplay] = useState(display);

  useEffect(() => {
    setShouldDisplay(display);
  }, [display]);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  const optionsDelete = async () => {
    const accessToken = await secureStorage.getItem('accessToken');
    const loggedId = await secureStorage.getItem('loggedId');
    console.log('todas notificações excluídas');
    api
      .delete('/notifications/user/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        localStorage.delete('displayNotif');
        localStorage.delete('header');
        setShouldDisplay(false);
        console.log('Todas as notificações foram excluídas.');
      })
      .catch((err) => console.log('Erro ao deletar todas as notificações:', err));
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
          <DeleteConfirmationButton
            onPress={() => {
              storage.delete('displayNotif');
              setShouldDisplay(false);
            }}>
            <ModalOptionsNotificationText font="inter-regular" color="#515151">
              Cancelar
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
        </DeleteConfirmationButtonContainer>
      </DeleteConfirmationCardContainer>
    </DeleteConfirmationContainer>
  );
}
