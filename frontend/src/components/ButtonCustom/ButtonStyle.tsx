import styled from 'styled-components/native';

// eslint-disable-next-line import/prefer-default-export
export const ButtonText = styled.Text<{ fontColor?: string; fontFamily?: string }>`
  color: ${(prop) => prop.fontColor};
  font-size: 20px;
  font-family: ${(prop) => prop.fontFamily};
`;

export const ButtonContainer = styled.TouchableOpacity<{
  backgroundColor?: string;
  border?: string;
}>`
  display: flex;
  background-color: ${(prop) => prop.backgroundColor};
  width: 100%;
  height: 67px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: ${(prop) => (prop.border ? 'solid 2px #160E47' : 'none')};
`;
