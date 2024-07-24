import styled from 'styled-components/native';

export const NotifButtonContainer = styled.View`
  display: flex;
  background-color: #f2f6fa;
  flex-direction: row;
  align-self: start;
  margin-left: 5.8vw;
`;
export const ConfigNotifText = styled.Text<{ font?: string }>`
  font-size: 14px;
  white-space: nowrap;
  position: absolute;
  color: #4e4e4e;
  font-family: ${(prop) => prop.font};
`;
export const ButtonImage = styled.Image`
  position: absolute;
  margin-left: 75vw;
`;
export const PressableCustom = styled.Pressable<{ isMoved?: boolean }>`
  z-index: 1;
  margin-left: 75vw;
  transform: ${(props) => `translateX(${props.isMoved ? 28 : 0}px)`};
`;
