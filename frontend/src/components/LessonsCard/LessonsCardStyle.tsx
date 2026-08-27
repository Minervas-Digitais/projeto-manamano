/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const LessonsCardWrapper = styled.View<{ showMenu?: boolean }>`
  width: 100%;
  position: relative;
  border: solid 1px #d8d7d7;
  border-radius: 15px;
  background-color: white;
  overflow: visible;
  z-index: ${(props: any) => (props.showMenu ? 999 : 1)};
`;

export const LessonsCardContainer = styled.TouchableOpacity<{ selected: any }>`
  display: flex;
  width: 100%;
  position: relative;
  padding: ${(props: any) => (props.selected ? '20px 20px 12px 20px' : '16px 20px 16px 20px')};
  gap: 14px;
  border-radius: 15px;
  overflow: visible;
  background-color: transparent;
  justify-content: center;
`;

export const LessonsCardInfoContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
`;

export const LessonsCardDivider = styled.View`
  height: 1px;
  background-color: #d8d7d7;
  align-self: stretch;
  margin-left: -20px;
  margin-right: -20px;
`;

export const LessonsCardFileContainer = styled.View`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: flex-start;
`;

export const FileButtonContainer = styled.Pressable`
  display: flex;
  flex-direction: row;
  gap: 15px;
  justify-content: center;
  align-items: center;
`;

export const FileButtonIconContainer = styled.View`
  width: 32px;
  height: 32px;
  background-color: #160e47;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
`;

export const FileButtonIcon = styled.Text`
  font-family: 'inter-regular';
  font-size: 20px;
  font-weight: 300;
  color: white;
  text-align: center;
  line-height: 20px;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  include-font-padding: false;
  text-align-vertical: center;
`;

export const FileButtonText = styled.Text`
  font-family: 'inter-bold';
  font-size: 13px;
  color: #160e47;
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
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 24px;
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
  flex: 1;
  line-height: 20px;
  text-align-vertical: center;
  include-font-padding: false;
`;

export const LessonsCardDateText = styled.Text`
  font-family: 'inter-bold';
  font-size: 12px;
  color: #160e47;
  flex-shrink: 0;
  line-height: 16px;
  text-align-vertical: center;
  include-font-padding: false;
`;

export const LessonsCardLinkIcon = styled.View`
  width: 20px;
  height: 21px;
`;

export const LessonsCardThreeDotsButton = styled.TouchableOpacity<{ selected?: boolean }>`
  position: absolute;
  top: ${(props: any) => (props.selected ? '14px' : '12px')};
  right: 10px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  z-index: 30;
`;

export const LessonsCardOptionsMenu = styled.View<{ selected?: boolean }>`
  position: absolute;
  top: ${(props: any) => (props.selected ? '46px' : '44px')};
  right: 10px;
  width: 160px;
  background-color: #ffffff;
  border-radius: 10px;
  border-width: 1px;
  border-color: #d8d7d7;
  z-index: 999;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
  overflow: hidden;
  opacity: 1;
`;

export const LessonsCardOption = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
`;

export const LessonsCardOptionDivider = styled.View`
  height: 1px;
  background-color: #eeeeee;
  width: 100%;
`;

export const LessonsCardOptionText = styled.Text`
  font-family: 'inter-regular';
  font-size: 13px;
  color: #515151;
`;

export const LessonsCardOptionTextDanger = styled.Text`
  font-family: 'inter-regular';
  font-size: 13px;
  color: #ef4036;
`;
