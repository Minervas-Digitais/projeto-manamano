/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ForgotPasswordText = styled.Text`
  color: #5e6366;
  font-size: 14px;
  font-family: 'inter-regular';
`;

export const ForgotPasswordEmailText = styled.Text`
  color: #160e47;
  font-family: 'inter-semiBold';
`;

export const ForgotPasswordTitle = styled.Text`
  color: #160e47;
  font-size: 18px;
  font-family: 'inter-bold';
`;

export const ResendButton = styled.TouchableOpacity`
  align-self: center;
  min-height: 44px;
  justify-content: center;
`;

export const ResendText = styled.Text<{ available: boolean }>`
  color: ${(prop) => (prop.available ? '#160E47' : '#9E9E9E')};
  font-size: 14px;
  font-family: 'inter-semiBold';
  text-decoration-line: ${(prop) => (prop.available ? 'underline' : 'none')};
`;
