/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  if (!visible) return null;

  const handleConfirm = () => {
    if (isConfirming) return;

    const result = onConfirm();
    if (result && typeof (result as Promise<void>).then === 'function') {
      setIsConfirming(true);
      (result as Promise<void>).finally(() => setIsConfirming(false));
    }
  };

  return (
    <DeleteConfirmationContainer display={visible}>
      <DeleteConfirmationCardContainer>
        <View>
          <ModalOptionsNotificationText font="inter-regular" color="#515151">
            {text}
          </ModalOptionsNotificationText>
        </View>
        <DeleteConfirmationButtonContainer>
          <DeleteConfirmationButton
            onPress={handleConfirm}
            testID="confirm-delete-button"
            disabled={isConfirming}
            accessibilityState={{ disabled: isConfirming, busy: isConfirming }}>
            {isConfirming ? (
              <ActivityIndicator size="small" color="#EF4036" testID="confirm-delete-loading" />
            ) : (
              <ModalOptionsNotificationText font="inter-regular" color="#EF4036">
                Excluir
              </ModalOptionsNotificationText>
            )}
          </DeleteConfirmationButton>
          <DeleteConfirmationButton
            onPress={onCancel}
            testID="cancel-delete-button"
            disabled={isConfirming}>
            <ModalOptionsNotificationText font="inter-regular" color="#515151">
              Cancelar
            </ModalOptionsNotificationText>
          </DeleteConfirmationButton>
        </DeleteConfirmationButtonContainer>
      </DeleteConfirmationCardContainer>
    </DeleteConfirmationContainer>
  );
}
