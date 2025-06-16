import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10%;
  background-color: #f2f6fa;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  ${Platform.select({
    ios: `
      shadow-color: rgba(141, 140, 140, 1);
      shadow-offset: 0px 4px;
      shadow-opacity: 0.2;
      shadow-radius: 8px;
    `,
    android: `
      elevation: 5;
    `,
    web: `  
    box-shadow: 0 4px 8px rgba(141, 140, 140, 0.2);
 `,
  })} z-index: 10;
`;
export const HeaderText = styled.Text<{ font?: string }>`
  font-size: 20px;
  color: #160e47;
  font-family: ${(prop) => prop.font};
`;
export const NoIcon = styled.View`
  width: 24px;
`;
