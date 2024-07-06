/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const SideMenuOptionsButtonsContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  gap: 15px;
`;
export const SideMenuOptionsButtonsText = styled.Text<{ font?: string }>`
  font-size: 20px;
  color: #170e49;
  font-family: ${(prop) => prop.font};
`;
