/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const CommentTextContainer = styled.View`
  left: 50px;
  width: calc(88vw - 50px);
`;

export const CommentText = styled.Text<{ font?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: 14px;
  text-align: justify;
  color: #515151;
`;
