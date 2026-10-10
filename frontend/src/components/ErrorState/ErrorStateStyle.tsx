import styled from 'styled-components/native';

export const ErrorContainer = styled.View<{ $inline?: boolean }>`
  ${(props) =>
    props.$inline
      ? `
      min-height: 120px;
      padding: 20px;`
      : `
      flex: 1;
      padding: 40px 20px;`}
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

export const ErrorText = styled.Text`
  font-family: 'inter-regular';
  font-size: 14px;
  color: #ef4036;
  text-align: center;
`;
