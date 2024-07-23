import styled from 'styled-components/native';

export const NotifButtonContainer = styled.View`
  display: flex;
  background-color: #fff;
  flex-direction: row;
  align-self: start;
  margin-left: 6vw;
`;
export const ConfigNotifText = styled.Text<{ font?: string }>`
  font-size: 14px;
  white-space: nowrap;
  position: absolute;
  color: #4e4e4e;
  font-family: ${(prop) => prop.font};
`;
