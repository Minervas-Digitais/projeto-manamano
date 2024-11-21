/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const HomePageBlue = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
  background-color: #170e49;
`;

export const HomePageWhite = styled.View`
  display: flex;
  width: 100vw;
  flex: 1;
  background-color: #ffffff;
  border-radius: 40px 40px 0px 0px;
  padding: 25px 0px 30px 0px;
  gap: 25px;
`;

export const HomeContainerInfo = styled.View`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 21vh;
  padding: 40px 25px 25px 25px;
`;

export const HomeContainerGroup = styled.View`
  display: flex;
  padding-left: 25px;
  gap: 25px;
`;
export const HomeContainerListGroup = styled.View`
  display: flex;
  flex-direction: row;
  gap: 25px;
  overflow-x: auto;
  padding: 0px 25px 0px 0px;
  scrollbar-width: none;
`;

export const HomeContainerMural = styled.View`
  display: flex;
  padding: 0px 25px 25px 30px;
  gap: 25px;
  flex: 1;
`;
export const HomeContainerListMural = styled.View`
  display: flex;
  flex-direction: column;
  gap: 25px;
  scrollbar-width: none;
  overflow-y: auto;
  height: 100%;
  padding-bottom: 10px;
`;
