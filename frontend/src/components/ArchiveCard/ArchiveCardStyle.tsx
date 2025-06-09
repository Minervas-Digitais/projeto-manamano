/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ArchiveCardContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 75px;
  height: 100px;
  border: #757474;
  border-radius: 8px;
  flex-shrink: 1;
  margin-right: 15px;
`;

export const MagnifyingGlassIcon = styled.Image`
  width: 33px;
  height: 33px;
  position: absolute;
`;
export const PaperclipIcon = styled.Image`
  width: 43px;
  height: 43px;
  position: absolute;
`;
export const AddRemoveArchiveIcon = styled.Pressable`
  width: 20px;
  height: 20px;
  position: absolute;
  top: -6px;
  right: -6px;
  border-radius: 10px;
`;
export const ArchivePressable = styled.Pressable`
  width: 75px;
  height: 100px;
`;
export const Empty = styled.View`
  width: 0px;
  height: 0px;
`;
export const ArchiveCardText = styled.Text<{ font?: string; size?: string }>`
  font-family: ${(prop) => prop.font};
  font-size: ${(prop) => prop.size};
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4e4e4e;
  padding-right: 10px;
  max-width: 75px;
  padding-left: 10px;
  word-break: break-word;
`;
