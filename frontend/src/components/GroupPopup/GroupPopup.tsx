/* eslint-disable global-require */
import React from 'react';
import { Modal, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font'; // Font loading hook
import { ModalOverlay, PopupContainer, PopupOption, PopupText } from './GroupPopupStyle'; // Custom styled components

// Define the types for the props expected by the ShowPopup component
interface ShowPopupProps {
  visible: boolean; // Controls visibility of the popup
  position: { top: number; left: number; bottom: number; right: number } | null; // Position of the popup
  onClose: () => void; // Function to close the popup
  onOptionSelect: (option: string) => void; // Function to handle option selection
}

export default function ShowPopup({ visible, position, onClose, onOptionSelect }: ShowPopupProps) {
  // Load custom font for the popup text
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  // If fonts are not loaded or position is not provided, return null (don't render the popup)
  if (!fontsLoaded || !position) {
    return null;
  }

  const { top, left, bottom, right } = position; // Destructure position object for easier use

  return (
    <Modal
      animationType="fade" // Modal transition effect
      transparent // Modal overlay is transparent
      visible={visible} // Control visibility using the `visible` prop
      onRequestClose={onClose} // Close the modal when the user presses the hardware back button (Android)
    >
      {/* TouchableWithoutFeedback to close the popup when the user taps outside of it */}
      <TouchableWithoutFeedback onPress={onClose}>
        <ModalOverlay>
          <TouchableWithoutFeedback>
            {/* Popup container with dynamic position styling */}
            <PopupContainer
              style={{
                position: 'absolute', // Absolute positioning for the popup
                top: bottom < 100 ? undefined : top, // If bottom space is insufficient, use top for positioning
                left: right < 100 ? undefined : left, // If right space is insufficient, use left for positioning
                bottom: bottom < 100 ? bottom : undefined, // If there is little space at the bottom, use it for positioning
                right: right < 100 ? right : undefined, // If there is little space at the right, use it for positioning
              }}>
              {/* Option for creating a new group */}
              <PopupOption onPress={() => onOptionSelect('Criar Grupo')}>
                <PopupText>Criar Grupo</PopupText>
                {' '}
                {/* Option text */}
              </PopupOption>

              {/* Option for joining an existing group */}
              <PopupOption onPress={() => onOptionSelect('Entrar Grupo')}>
                <PopupText>Entrar em Grupo</PopupText>
                {' '}
                {/* Option text */}
              </PopupOption>
            </PopupContainer>
          </TouchableWithoutFeedback>
        </ModalOverlay>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
