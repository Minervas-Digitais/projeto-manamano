/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const GroupsContainer = styled.View`
  display: flex;
  width: 100vw;
  height: 100vh;
`;

export const GroupsBody = styled.View`
  display: flex;
  height: 89vh;
  width: 100vw;
  background-color: #f2f6fa;
  z-index: -1;
  padding: 25px;
`;

export const GroupsList = styled.View`
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: #f2f6fa;
  gap: 25px;
  overflow-y: auto;
  scrollbar-width: none;
`;
