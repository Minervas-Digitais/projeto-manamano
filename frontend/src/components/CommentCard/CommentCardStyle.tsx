/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export const CommentTextContainer = styled.View`
  left: 50px;
  width: ${() => width * 0.88 - 50}px;
`;

export const CommentText = styled.Text<{ font?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: 14px;
  text-align: justify;
  color: #515151;
`;
