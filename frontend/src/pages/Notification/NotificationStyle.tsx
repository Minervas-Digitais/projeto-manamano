/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ConfigNotificationContainer = styled.View`
  display: flex;
  background-color: #f2f6fa;
  width: 100vw;
  height: 100vh;
`;

export const NotificationInfoContainer = styled.View`
  display: flex;
  align-items: center;
  gap: 40px;
  margin-top: 10px;
`;

export const NotificationInfoText = styled.Text<{ font: any }>`
  display: flex;
  color: #160e47;
  font-family: ${(prop) => prop.font};
  font-size: 20px;
  width: 380px;
  text-align: center;
`;

export const NotificationBodyContainer = styled.View`
  display: flex;
  padding: 25px;
  align-items: center;
  justify-content: space-between;
  height: 89vh;
`;

export const ConfigNotificationHeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  background-color: #f2f6fa;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(141, 140, 140, 0.2);
  height: 96px;
  padding: 25px;
`;

export const ConfigNotificationTitle = styled.Text<{ font: any }>`
  font-family: ${(prop) => prop.font};
  font-size: 20px;
  color: #160e47;
`;
