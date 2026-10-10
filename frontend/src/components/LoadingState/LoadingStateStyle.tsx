import styled from 'styled-components/native';

export const LoadingContainer = styled.View<{ $inline?: boolean }>`
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
`;

export const LoadingText = styled.Text`
  margin-top: 8px;
  font-family: 'inter-regular';
  font-size: 12px;
  color: #8f8f8f;
  text-align: center;
`;
