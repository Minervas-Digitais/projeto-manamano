import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export const NotifButtonContainer = styled.View`
  display: flex;
  background-color: #f2f6fa;
  flex-direction: row;
  align-items: center;
  margin-left: ${width * 0.058}px;
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
  margin-left: ${width * 0.75}px;
`;
export const ToggleThumbContainer = styled.View<{ isMoved?: boolean }>`
  z-index: 1;
  margin-left: ${width * 0.75}px;
  transform: ${(props) => `translateX(${props.isMoved ? 24 : 0}px)`};
`;