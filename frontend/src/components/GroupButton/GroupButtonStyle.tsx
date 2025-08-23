import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

// eslint-disable-next-line import/prefer-default-export
/*
export const GroupButtonContainer = styled(LinearGradient).attrs(() => ({
  colors: ['#1A0E47FF', '#170E47E3', '#160E47D1', '#170E47C7'],
  locations: [0, 0.85, 1, 1],
}))`
  display: flex;
  width: 157px;
  height: 133px;
  border-radius: 15px;
  padding: 18px;
  justify-content: space-between;
`;
*/

// =======================================================================================
export const GroupButtonContainer = styled.TouchableOpacity`
  width: 157px;
  height: 133px;
  border-radius: 15px;
  /* Importante: overflow hidden para o gradiente não vazar das bordas arredondadas */
  overflow: hidden;
`;

export const GradientBackgroundStyled = styled(LinearGradient)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

export const GroupContentWrapper = styled.View`
  display: flex;
  flex: 1; /* Para ocupar todo o espaço do botão */
  padding: 18px;
  justify-content: space-between;
  /* Garante que o conteúdo fique sobre o fundo */
  z-index: 1;
`;
// =======================================================================================

export const GroupTextContainer = styled.View`
  width: 100%;
  gap: 8px;
  display: flex;
`;

export const GroupName = styled.Text<{ fontFamily: string }>`
  font-family: ${(prop) => prop.fontFamily};
  color: white;
  font-size: 16px;
`;

export const GroupOnlineContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
`;

export const GroupOnline = styled.Text<{ fontFamily: string }>`
  font-family: ${(prop) => prop.fontFamily};
  color: white;
  font-size: 12px;
`;

export const GroupOnlineCircle = styled.View`
  background-color: #ef4036;
  width: 12px;
  height: 12px;
  border-radius: 50px;
`;

export const GroupFilterContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const GroupButtonImage = styled.TouchableOpacity<{ size?: any }>`
  display: ${(prop) => (prop.size ? 'none' : 'flex')};
`;
