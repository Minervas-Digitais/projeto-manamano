import styled from 'styled-components/native';

export const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10vh;
  background-color: #fff;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 5px black;
`;
export const HeaderText = styled.Text<{ font?: string }>`
  font-size: 20px;
  color: #160e47;
  font-family: ${(prop) => prop.font};
`;
export const HeaderImage = styled.Image`
  position: absolute;
  margin-right: 82vw;
`;
