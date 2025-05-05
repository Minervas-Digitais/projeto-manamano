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
} from './DeleteConfirmationStyle';
import { ModalOptionsNotificationText } from '../ModalOptionsNotification/ModalOptionsNotificationStyle';
import { storage } from '../../pages/SignIn/SignIn';
import api from '../../services/api';

export default function DeleteConfirmation({ text }: any) {
  const current = storage.getString('displayNotif');

  const [shouldDisplay, setShouldDisplay] = useState(current);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  const optionsDelete = () => {
    const id = storage.getString('idNotif');
    const accessToken = storage.getString('accessToken');

    api
      .delete(`notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        storage.delete('displayNotif');
        setShouldDisplay(false);
      })
      .catch((err) => console.log('Erro ao deletar a notificação:', err));
  };

  if (!fontsLoaded) return null;

  return (
    <DeleteConfirmationContainer display={current}>
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
            }}
          >
            <ModalOptionsNotificationText font="inter-regular" color="#515151">
              Cancelar
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
        </DeleteConfirmationButtonContainer>
      </DeleteConfirmationCardContainer>
    </DeleteConfirmationContainer>
  );
}
