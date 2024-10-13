/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const PostContainer = styled.View`
  align-self: center;
  width: 88vw;
  margin-top: 3vh;
  gap: 15px;
`;
export const ProfileImage = styled.Image`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  border-color: #160e47;
  border-width: 2px;
`;
export const PostText = styled.Text<{ font?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: 14px;
  text-align: justify;
  color: #515151;
`;
export const PostUpperPart = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
export const ProfileName = styled.Text<{ font?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: 12px;
  color: #4e4e4e;
`;
export const PostDate = styled.Text<{ font?: string }>`
  margin-left: auto;
  font-family: ${(prop) => prop.font};
  font-size: 10px;
  color: #515151;
`;
export const HorizontalSeparator = styled.View`
  flex-direction: row;
  width: 100vw;
  height: 1px;
  background-color: rgba(141, 140, 140, 0.2);
`;
export const CommentsContainer = styled.View`
  background-color: #f2f6fa;
  padding-bottom: 30px;
  gap: 20px;
`;
