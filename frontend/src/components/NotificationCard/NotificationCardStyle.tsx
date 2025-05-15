/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const NotificationContainer = styled.TouchableOpacity<{ isread?: any }>`
  display: flex;
  gap: 15px;
  width: 100%;
  height: fit-content;
  background-color: #edf1f5;
  padding: 14px;
  border: ${(prop) => (prop.isread ? 'none' : 'solid 1px red')};
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(39, 39, 39, 0.2);
`;

export const NotificationTextContainer = styled.View`
  display: flex;
  width: 100%;
  height: min-content;
  overflow-y: auto;
  flex-direction: row;
  gap: 14px;
`;

export const NotificationTextContainerWarning = styled.View<{ height?: any }>`
  display: flex;
  width: 100%;
  height: ${(prop) => prop.height};
  flex-direction: row;
  justify-content: space-between;
  gap: 8.5px;
`;

export const NotificationTextGreyWarning = styled.Text<{ font?: any }>`
  color: #515151;
  font-size: 14px;
  height: min-content;
  font-family: ${(prop) => prop.font};
  overflow: hidden;
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
