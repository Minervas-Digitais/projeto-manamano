/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const CommentInputTextFocused = styled.TextInput`
  width: 100%;
  height: 120px;
  background-color: transparent;
  border: none;
  outline-width: 0px;
  color: #5e6366;
  text-align: justify;
`;
export const CommentInputText = styled.TextInput`
  width: 100%;
  height: 40px;
  background-color: transparent;
  border: none;
  border-radius: 5px;
  outline-color: transparent;
  outline-width: 1px;
  color: #5e6366;
  text-align: justify;
`;
export const CommentInputTextContainer = styled.View`
  flex-direction: row;
  gap: 15px;
  width: 88vw;
`;
export const CommentInputContainerFocused = styled.View`
  display: flex;
  width: 72vw;
  height: 143px;
  border: solid 1.5px #d8d7d7;
  border-radius: 20px;
  padding: 10px;
  gap: 5px;
`;
export const CommentInputContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 72vw;
  height: 50px;
  border: solid 1.5px #d8d7d7;
  border-radius: 20px;
  padding: 15px;
  gap: 5px;
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
