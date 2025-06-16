/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const NewPostArchiveContainer = styled.View`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: #757474;
  border-radius: 8px;
  margin-top: 10px;
`;
export const RemoveArchiveIcon = styled.Pressable`
  width: 20px;
  height: 20px;
  position: absolute;
  top: -8px;
  right: -4px;
  border-radius: 10px;
`;
export const NewPostArchivePressable = styled.Pressable`
  width: 50px;
  height: 50px;
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
  padding-left: 10px;
`;
