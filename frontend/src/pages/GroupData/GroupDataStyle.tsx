/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const GroupDataPage = styled.View`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: auto;
`;

export const GroupDataText = styled.Text<{ font?: string; color?: string; size?: string }>`
  color: ${(prop) => prop.color};
  font-family: ${(prop) => prop.font};
  font-size: ${(prop) => prop.size};
`;

export const GroupDataContainer = styled.View`
  display: flex;
  height: 90vh;
  width: 100%;
  background-color: #f2f6fa;
`;

export const GroupDataContainerInfo = styled.View<{ size?: any }>`
  display: flex;
  height: ${(prop) => prop.size};
  width: 100%;
  padding: 25px;
  background-color: #f2f6fa;
  gap: 20px;
`;

export const GroupDataScrollView = styled.View<{ size?: any; gap?: any }>`
  width: 100%;
  height: ${(prop) => prop.size};
  overflow: auto;
  gap: ${(prop) => prop.gap};
`;

export const GroupDataLine = styled.View`
  width: 100%;
  border: 1px #d9d9d9 solid;
`;

export const GroupDataButtonView = styled.View`
  padding: 0px 25px 50px 25px;
`;
