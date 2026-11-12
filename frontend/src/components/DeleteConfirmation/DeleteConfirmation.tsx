/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  const optionsDelete = async () => {
    if (isDeleting) return;

    const id = localStorage.getString('idNotif');
    setIsDeleting(true);

    try {
      await api.delete(`notifications/${id}`);
      localStorage.delete('displayNotif');
      setShouldDisplay(undefined);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir a notificação',
        text2: 'Não foi possível excluir a notificação. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
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
          <DeleteConfirmationButton
            onPress={optionsDelete}
            disabled={isDeleting}
            accessibilityState={{ disabled: isDeleting, busy: isDeleting }}>
            {isDeleting ? (
              <ActivityIndicator
                size="small"
                color="#EF4036"
                testID="confirm-delete-notification-loading"
              />
            ) : (
              <ModalOptionsNotificationText font="inter-regular" color="#EF4036">
                Excluir
              </ModalOptionsNotificationText>
            )}
          </DeleteConfirmationButton>
          <DeleteConfirmationButton
            disabled={isDeleting}
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
