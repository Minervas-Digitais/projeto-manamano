import styled from 'styled-components/native';

// Overlay to darken the background
export const ModalOverlay = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: flex-end;
`;

// Container for the popup
export const PopupContainer = styled.View`
  border-radius: 12px;
  width: 160px;
  align-items: flex-start;
  elevation: 5;
  margin-bottom: 80px;
  margin-right: 20px;
  padding: 10px 0;
  background-color: #ffffff;
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
