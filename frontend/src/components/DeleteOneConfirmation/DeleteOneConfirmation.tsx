/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  DeleteConfirmationButton,
  DeleteConfirmationButtonContainer,
  DeleteConfirmationCardContainer,
  DeleteConfirmationContainer,
} from './DeleteOneConfirmationStyle';
import { ModalOptionsNotificationText } from '../ModalOptionsNotification/ModalOptionsNotificationStyle';

export default function DeleteOneConfirmation({
  visible,
  text,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  if (!visible) return null;

  return (
    <DeleteConfirmationContainer display={visible}>
      <DeleteConfirmationCardContainer>
        <View>
          <ModalOptionsNotificationText font="inter-regular" color="#515151">
            {text}
          </ModalOptionsNotificationText>
        </View>
        <DeleteConfirmationButtonContainer>
          <DeleteConfirmationButton onPress={onConfirm} testID="confirm-delete-button">
            <ModalOptionsNotificationText font="inter-regular" color="#EF4036">
              Excluir
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
          <DeleteConfirmationButton onPress={onCancel} testID="cancel-delete-button">
            <ModalOptionsNotificationText font="inter-regular" color="#515151">
              Cancelar
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
        </DeleteConfirmationButtonContainer>
      </DeleteConfirmationCardContainer>
    </DeleteConfirmationContainer>
  );
}
