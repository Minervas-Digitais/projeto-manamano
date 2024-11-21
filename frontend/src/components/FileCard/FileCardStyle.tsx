/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const FileCardContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 62px;
  border: solid 1px #d8d7d7;
  border-radius: 15px;
  padding: 10px;
`;
export const FileCardInfoContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export const FileCardImageContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
`;
