import styled from 'styled-components/native';

export const Container = styled.View`
  background-color: #f9f9f9;
  border-radius: 10px;
  width: 100%;
  flex: 1;
  margin: 0 auto;
`;

export const Section = styled.View`
  background-color: #ffffff;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 15px;
`;

export const Card = styled.View`
  flex-direction: row; /* Use flex-direction para alinhar horizontalmente */
  align-items: center;
  margin-bottom: 10px;
`;

export const Avatar = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px; /* Para criar um círculo, o valor deve ser metade da largura/altura */
  margin-right: 15px;
`;

export const Name = styled.Text`
  font-size: 16px;
`;

export const StyledButton = styled.TouchableOpacity`
  width: 100%;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-top: 15px;
  align-items: center; 
`;

export const ButtonText = styled.Text`
  font-size: 16px;
  color: #333;
`;

