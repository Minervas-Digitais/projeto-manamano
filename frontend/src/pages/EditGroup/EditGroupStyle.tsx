/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const EditGroupPage = styled.View`
  display: flex;
  background-color: #f2f6fa;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
`;

export const EditGroupContainer = styled.View`
  display: flex;
  background-color: #f2f6fa;
  flex: 1;
  justify-content: space-between;
  padding: 25px 25px 25px 25px;
  border: solid white 2px;
`;

export const EditGroupForm = styled.View`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 45px;
`;

export const EditGroupCategoryContainer = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-bottom: 5px;
  gap: 3px;
`;
