import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');


export const NotifButtonContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f2f6fa;
  height: 60px;
  margin-left: ${width * 0.05}px;
  margin-right: ${width * 0.05}px;
  position: relative;
`;


export const ConfigNotifText = styled.Text<{ font?: string }>`
  font-size: 14px;
  white-space: nowrap;
  position: absolute;
  color: #4e4e4e;
  font-family: ${(prop) => prop.font};
`;

export const ButtonImage = styled.View`
  position: absolute;
  right: 0;
`;

export const PressableCustom = styled.Pressable<{ isMoved?: boolean }>`
 
  position: absolute;
  right: 0;
  z-index: 1;
  transform: ${(props) => `translateX(${props.isMoved ? -23 : 2}px)`};
`;