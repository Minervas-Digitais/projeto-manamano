/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const NotificationContainer = styled.TouchableOpacity`
  display: flex;
  gap: 15px;
  width: 100%;
  height: 98px;
  background-color: #edf1f5;
  padding: 14px;
  box-shadow: 0 4px 8px rgba(39, 39, 39, 0.2);
`;

export const NotificationTextContainer = styled.View`
  display: flex;
  width: 100%;
  height: 51px;
  overflow-y: auto;
  flex-direction: row;
  gap: 14px;
`;
export const NotificationTextRed = styled.Text<{ font?: any }>`
  color: #ef4036;
  font-size: 14px;
  font-family: ${(prop) => prop.font};
`;

export const NotificationTextGrey = styled.Text<{ font?: any }>`
  color: #515151;
  font-size: 14px;
  font-family: ${(prop) => prop.font};
`;

export const NotificationTextDateContainer = styled.View`
  display: flex;
  width: 100%;
  align-items: flex-end;
`;

export const NotificationTextDate = styled.Text<{ font?: any }>`
  color: #515151;
  font-size: 10px;
  font-family: ${(prop) => prop.font};
`;

export const NotificationImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;
