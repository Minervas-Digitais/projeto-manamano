/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const AttachmentContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: ${width * 0.35}px;
  height: ${height * 0.0752}px;
  border: rgba(141, 140, 140, 0.2);
  border-radius: 8px;
  padding-left: ${width * 0.027}px;
  flex-shrink: 1;
`;

export const VerticalSeparator = styled.View`
  width: 1px;
  height: 100%;
  background-color: rgba(141, 140, 140, 0.2);
  margin-left: ${width * 0.027}px;
  margin-right: ${width * 0.027}px;
`;

export const AttachmentLinkIcon = styled.Image`
  width: ${width * 0.0775}px; // 7.75vw
  resize-mode: contain;
`;

export const AttachmentArchiveIcon = styled.Image`
  width: ${width * 0.0622}px;
  resize-mode: contain;
`;

export const AttachmentText = styled.Text<{ font?: string; size?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: ${(prop) => prop.size};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4e4e4e;
  padding-right: 10px;
  max-width: ${width * 0.21}px;
`;

export const AttachmentType = styled.Text<{ font?: string }>`
  color: #4e4e4e;
  font-family: ${(prop) => prop.font};
  font-size: 10px;
  padding-top: 8px;
`;
