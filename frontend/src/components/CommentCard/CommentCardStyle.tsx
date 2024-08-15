/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const CommentCardContainer = styled.View`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px 14px 10px 14px;
  gap: 5px;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  border: solid 1px #d8d7d7;
`;

export const CommentCardTag = styled.View`
  display: flex;
  width: 93px;
  height: 27px;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 0px 0px 10px 10px;
  background-color: #170e49;
  padding: 0px 3px 0px 3px;
`;

export const CommentCardSpaceBetween = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

export const CommentCardIcons = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

export const CommentCardImage = styled.Image<{ width?: any; height?: any }>`
  width: ${(prop) => (prop.width ? prop.width : 'auto')};
  height: ${(prop) => (prop.height ? prop.height : 'auto')};
`;
export const CommentCardImageUser = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;
