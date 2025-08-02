/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { height } = Dimensions.get('window');

export const HomePageBlue = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: #170e49;
`;

export const HomePageWhite = styled.View`
  display: flex;
  width: 100%;
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
  height: ${height * 0.21}px;
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
  padding: 0px 25px 35px 30px; /* padding-bottom aumentado */
  gap: 25px;
  flex: 1; /* Garante que o container ocupe o espaço disponível */
`;

// Transformado em ScrollView e limpo de estilos que foram para o container
export const HomeContainerListMural = styled.ScrollView``;
