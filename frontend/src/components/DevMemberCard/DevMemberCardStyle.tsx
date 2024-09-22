/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const DevMemberCardContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border: solid 1px #d8d7d7;
  border-radius: 20px;
  padding: 17px;
  gap: 10px;
  height: 109px;
`;
export const DevMemberCardContainerInfo = styled.View`
  display: flex;
  height: 100%;
  flex: 1;
  gap: 10px;
  flex-direction: column;
`;

export const DevMemberCardImage = styled.Image`
  position: relative;
  width: 75px;
  height: 75px;
  border-radius: 50%;
`;

export const DevMemberCardView = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
