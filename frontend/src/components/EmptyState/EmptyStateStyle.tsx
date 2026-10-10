import styled from 'styled-components/native';

export const EmptyContainer = styled.View<{ $inline?: boolean }>`
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
  gap: 12px;
`;

export const EmptyText = styled.Text`
  font-family: 'inter-regular';
  font-size: 14px;
  color: #8f8f8f;
  text-align: center;
`;
