import styled from 'styled-components/native';

export const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10vh;
  background-color: #f2f6fa;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(141, 140, 140, 0.2);
`;
export const HeaderText = styled.Text<{ font?: string }>`
  font-size: 20px;
  color: #160e47;
  font-family: ${(prop) => prop.font};
`;
export const HeaderTouchable = styled.TouchableOpacity`
  position: absolute;
  margin-right: 82vw;
`;
