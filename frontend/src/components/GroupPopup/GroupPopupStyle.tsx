import styled from 'styled-components/native';

// Overlay to darken the background
export const ModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

// Container for the popup
export const PopupContainer = styled.View`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 10px 0;
  width: 160px;
  align-items: flex-start;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  elevation: 5;
  position: absolute; /* Allow absolute positioning */
`;

// Individual option within the popup
export const PopupOption = styled.Pressable`
  padding: 12px 15px;
  width: 100%;
`;

// Text inside each option
export const PopupText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #000000;
`;

