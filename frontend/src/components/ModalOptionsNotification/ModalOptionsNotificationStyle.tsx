/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ModalOptionsNotificationContainer = styled.View<{ display: any; height: any }>`
  display: ${(prop) => (prop.display ? 'flex' : 'none')};
  z-index: 9;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  height: ${(prop) => (prop.height ? prop.height : '70px')};
  width: 194px;
  background-color: #f2f6fa;
  box-shadow: 0 4px 8px rgba(39, 39, 39, 0.2);
  gap: 6px;
  padding: 15px;
  border-radius: 15px;
  position: absolute;
  top: 25;
  right: 30;
`;

export const ModalOptionsNotificationInfo = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 6px;
`;

export const ModalOptionsNotificationText = styled.Text<{ font: any; color: any }>`
  font-family: ${(prop) => prop.font};
  font-size: 13px;
  color: ${(prop) => prop.color};
`;
