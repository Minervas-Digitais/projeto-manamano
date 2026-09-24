/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import {
  DeleteConfirmationButton,
  DeleteConfirmationButtonContainer,
  DeleteConfirmationCardContainer,
  DeleteConfirmationContainer,
} from './DeleteConfirmationStyle';
import { ModalOptionsNotificationText } from '../ModalOptionsNotification/ModalOptionsNotificationStyle';
import localStorage from '../../services/localStorage';
import api from '../../services/api';

export default function DeleteConfirmation({ text }: any) {
  const current = localStorage.getString('displayNotif');

  const [shouldDisplay, setShouldDisplay] = useState(current);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  const optionsDelete = async () => {
    const id = localStorage.getString('idNotif');

    api
      .delete(`notifications/${id}`)
      .then(() => {
        localStorage.delete('displayNotif');
        setShouldDisplay(undefined);
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Erro ao excluir a notificação',
          text2: 'Não foi possível excluir a notificação. Tente novamente.',
        });
      });
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
              localStorage.delete('displayNotif');
              setShouldDisplay(undefined);
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
