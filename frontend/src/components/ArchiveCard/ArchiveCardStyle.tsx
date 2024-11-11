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
export const AddRemoveArchiveIcon = styled.Image`
  width: 20px;
  height: 20px;
  position: absolute;
  top: -6px;
  right: -6px;
`;
export const ArchivePressable = styled.Pressable`
  width: 75px;
  height: 100px;
`;
