/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const AttachmentContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 35vw;
  height: 7.52vh;
  border: rgba(141, 140, 140, 0.2);
  border-radius: 8px;
  padding-left: 2.7vw;
  flex-shrink: 1;
`;
export const VerticalSeparator = styled.View`
  width: 1px;
  height: 100%;
  background-color: rgba(141, 140, 140, 0.2);
  margin-left: 2.7vw;
  margin-right: 2.7vw;
`;
export const AttachmentLinkIcon = styled.Image`
  width: 7.75vw;
  resize-mode: contain;
`;
export const AttachmentArchiveIcon = styled.Image`
  width: 6.22vw;
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
  max-width: 21vw;
`;
export const AttachmentType = styled.Text<{ font?: string }>`
  color: #4e4e4e;
  font-family: ${(prop) => prop.font};
  font-size: 10px;
  padding-top: 8px;
`;
