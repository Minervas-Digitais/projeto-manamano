/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const LessonsCardContainer = styled.TouchableOpacity<{ selected: any }>`
  display: flex;
  width: 100%;
  height: ${(prop) => (prop.selected ? '154px' : '62px')};
  border: solid 1px #d8d7d7;
  padding: 20px;
  gap: 14px;
  border-radius: 15px;
`;

export const LessonsCardInfoContainer = styled.View`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

export const LessonsCardButtonContainer = styled.TouchableOpacity<{
  backgroundColor?: string;
  border?: boolean;
}>`
  display: flex;
  background-color: ${(prop) => prop.backgroundColor};
  flex: 1;
  height: 42px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: ${(prop) => (prop.border ? 'solid 2px #160E47' : 'none')};
  padding: 0px 5px 0px 5px;
`;
