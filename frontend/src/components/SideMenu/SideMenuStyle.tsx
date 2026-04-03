/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SideMenuPage = styled.View<{ display?: any }>`
  display: ${(prop) => (prop.display ? 'none' : 'flex')};
  flex-direction: row;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
`;

export const SideMenuContainerShadow = styled.View`
  display: flex;
  width: ${width * 0.28}px;
  height: 100%;
  background-color: #1a1a1aa2;
`;

export const SideMenuContainer = styled.View`
  display: flex;
  width: ${width * 0.72}px;
  height: 100%;
  background-color: #f2f6fa;
`;

export const SideMenuLogoContainer = styled.TouchableOpacity`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${height * 0.18}px;
`;

export const SideMenuOptionsContainer = styled.View`
  width: 100%;
  height: ${height * 0.65}px;
  padding-left: 30px;
  padding-top: 30px;
  gap: 25px;
`;

export const SideMenuBottomOptionsContainer = styled.View`
  width: 100%;
  margin-top: auto;
  padding-left: 30px;
  padding-top: 20px;
  padding-bottom: 24px;
  gap: 25px;
`;

export const SideMenuLineContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const SideMenuLine = styled.View`
  display: flex;
  width: ${width * 0.72}px;
  border: solid 1px #170e49;
`;
