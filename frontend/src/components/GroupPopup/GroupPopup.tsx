/* eslint-disable global-require */
import React from 'react';
import { Modal, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import { ModalOverlay, PopupContainer, PopupOption, PopupText } from './GroupPopupStyle';

// Define the types for the props expected by the ShowPopup component
interface ShowPopupProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
}

export default function ShowPopup({ visible, onClose, onOptionSelect }: ShowPopupProps) {
  // Load custom font for the popup text
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  // If fonts are not loaded, return null
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <ModalOverlay>
          <TouchableWithoutFeedback>
            <PopupContainer>
              <PopupOption onPress={() => onOptionSelect('Criar Grupo')}>
                <PopupText>Criar Grupo</PopupText>
              </PopupOption>

              <PopupOption onPress={() => onOptionSelect('Entrar Grupo')}>
                <PopupText>Entrar em Grupo</PopupText>
              </PopupOption>
            </PopupContainer>
          </TouchableWithoutFeedback>
        </ModalOverlay>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
