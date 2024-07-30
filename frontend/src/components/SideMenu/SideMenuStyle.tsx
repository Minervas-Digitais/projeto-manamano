/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const SideMenuPage = styled.View<{ display?: any }>`
  display: ${(prop) => (prop.display ? 'none' : 'flex')};
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  position: absolute;
  z-index: 1;
`;

export const SideMenuContainerShadow = styled.View`
  display: flex;
  width: 28vw;
  height: 100vh;
  background-color: #1a1a1aa2;
`;

export const SideMenuContainer = styled.View`
  display: flex;
  width: 72vw;
  height: 100vh;
  background-color: #f2f6fa;
`;

export const SideMenuLogoContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 18vh;
`;

export const SideMenuOptionsContainer = styled.View`
  width: 100%;
  height: 65vh;
  padding-left: 30px;
  padding-top: 30px;
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
  width: 90%;
  border: solid 1px #170e49;
`;
