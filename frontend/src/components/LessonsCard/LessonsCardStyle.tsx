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
  flex-direction: row;
  gap: 5px;
  align-items: center;
`;

export const LessonsCardInfoContainerWithGap = styled.View`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

export const LessonsCardInfoContainerSpaceBetween = styled.View`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

export const LessonsCardTitleContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  flex: 1;
  margin-right: 10px;
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

export const LessonsCardButtonContainerRow = styled.TouchableOpacity<{
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
  flex-direction: row;
`;

export const LessonsCardTitleText = styled.Text`
  font-family: 'inter-bold';
  font-size: 16px;
  color: #4e4e4e;
  z-index: 3;
  flex: 1;
`;

export const LessonsCardDateText = styled.Text`
  font-family: 'inter-bold';
  font-size: 12px;
  color: #160e47;
  flex-shrink: 0;
`;

export const LessonsCardLinkIcon = styled.View`
  width: 20px;
  height: 21px;
`;
