import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

// eslint-disable-next-line import/prefer-default-export
export const ADMButtonText = styled.Text<{ fontColor?: string; fontFamily?: string }>`
  color: ${(prop) => prop.fontColor};
  font-size: 16px;
  font-family: ${(prop) => prop.fontFamily};
`;

export const ADMButtonContainer = styled.TouchableOpacity<{
  border?: string;
}>`
  padding-top: 25px;
  display: flex;
  width: 155px;
  height: 150px;
  border-radius: 15px;
  flex-direction: row;
  border: ${(prop) => (prop.border ? 'solid 2px #160E47' : 'none')};
`;

export const ADMButtonGradient = styled(LinearGradient).attrs({
  colors: ['#1A0E47FF', '#170E47E3', '#160E47D1', '#170E47C7'],
  locations: [0, 0.85, 1, 1],
})`
  flex: 1;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  gap: 10px;
`;
