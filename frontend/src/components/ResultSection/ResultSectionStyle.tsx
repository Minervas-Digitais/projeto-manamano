import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  background-color: #f2f6fa;
  border-radius: 10px;
  flex: 1;
`;

export const Section = styled.View`
  background-color: #f2f6fa;
  border-radius: 15px;
  margin: 10px;
  ${Platform.select({
    ios: `
      shadow-color: rgba(0, 0, 0, 0.1);
      shadow-offset: 0px 2px;
      shadow-opacity: 1;
      shadow-radius: 10px;
    `,
    android: `
      elevation: 8;
    `,
    web: `
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    `,
  })}
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  margin: 15px;
`;

export const Card = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  justify-content: space-between;
  padding-right: 20px;
`;

export const Avatar = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px; /* Para criar um círculo, o valor deve ser metade da largura/altura */
  margin-right: 15px;
  border: 2px;
`;

export const Name = styled.Text<{ fontColor?: string; fontFamily?: string }>`
  color: ${(prop) => prop.fontColor};
  font-size: 12px;
  font-family: ${(prop) => prop.fontFamily};
`;

export const StyledButton = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 8px;
  margin-top: 15px;
  align-items: center;
`;

export const ButtonText = styled.Text`
  font-size: 16px;
  color: #333;
`;
