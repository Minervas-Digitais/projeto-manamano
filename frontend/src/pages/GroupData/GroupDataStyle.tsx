/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { height } = Dimensions.get('window');

export const GroupDataPage = styled.View`
  display: flex;
  flex: 1;
  background-color: #f2f6fa;
`;

export const GroupDataScrollView = styled.ScrollView`
  flex: 1;
  background-color: #f2f6fa;
`;

export const GroupDataText = styled.Text<{ font?: string; color?: string; size?: string }>`
  color: ${(prop) => prop.color};
  font-family: ${(prop) => prop.font};
  font-size: ${(prop) => prop.size};
`;

export const GroupDataContainer = styled.View`
  display: flex;
  height: ${height * 0.9}px;
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

export const GroupDataScrollContent = styled.View`
  width: 100%;
`;

export const GroupDataScrollContentInner = styled.View<{ gap?: any }>`
  width: 100%;
  gap: ${(prop) => prop.gap};
`;

export const GroupDataLine = styled.View`
  width: 100%;
  border: 1px #d9d9d9 solid;
`;

export const GroupDataButtonView = styled.View`
  padding: 16px 25px 25px 25px;
  background-color: #f2f6fa;
  border-top-width: 1px;
  border-top-color: #d9d9d9;
`;
