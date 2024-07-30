import styled from 'styled-components/native';

export const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  height: 10vh;
  align-self: center;
  margin-top: 4vh;
  background-color: #f2f6fa;
`;
export const HeaderText = styled.Text<{ font?: string }>`
  font-size: 20px;
  color: #160e47;
  font-family: ${(prop) => prop.font};
`;
export const HeaderImage = styled.Image<{ source?: any }>`
  position: absolute;
  margin-top: 4vh;
  align-self: start;
  margin-left: 2.7vh;
`;
