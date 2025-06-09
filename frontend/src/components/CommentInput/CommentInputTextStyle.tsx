/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

export const CommentInputTextFocused = styled.TextInput`
  width: 100%;
  height: ${height * 0.1}px;
  background-color: transparent;
  border: none;
  outline-width: 0px;
  color: #5e6366;
  text-align: justify;
  text-align-vertical: top;
`;
export const CommentInputText = styled.TextInput`
  width: ${width * 0.72}px;
  height: ${height * 0.0536}px;
  color: #5e6366;
  text-align: justify;
  text-align-vertical: center;
  padding-left: 15px;
`;
export const CommentInputTextContainer = styled.View`
  flex-direction: row;
  gap: 15px;
  width: ${width * 0.88}px;
  flex: 1;
`;
export const CommentInputContainerFocused = styled.View`
  width: ${width * 0.72}px;
  height: ${height * 0.18}px;
  border: solid 1.5px #d8d7d7;
  border-radius: 20px;
  padding: 10px;
  gap: 5px;
`;
export const CommentInputContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: ${width * 0.72}px;
  height: ${height * 0.0536}px;
  border: solid 1.5px #d8d7d7;
  border-radius: 8px;
  flex: 1;
`;
export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
`;
export const LargerProfileImage = styled.Image`
  height: 50px;
  width: 50px;
  border-radius: 25px;
  border-color: #160e47;
  border-width: 2px;
`;
