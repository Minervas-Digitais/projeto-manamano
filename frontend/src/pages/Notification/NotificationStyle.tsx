/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ConfigNotificationContainer = styled.View`
  display: flex;
  background-color: #f2f6fa;
  width: 100%;
  height: 100%;
`;

export const NotificationInfoContainer = styled.View`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  width: 100%;
`;

export const NotificationInfoText = styled.Text<{ font: any }>`
  display: flex;
  color: #160e47;
  font-family: ${(prop) => prop.font};
  font-size: 20px;
  width: 100%;
  text-align: center;
`;

export const NotificationBodyContainer = styled.View`
  display: flex;
  padding: 25px;
  align-items: center;
  justify-content: space-between;
  height: 89%;
  overflow-y: auto;
  gap: 20px;
`;
