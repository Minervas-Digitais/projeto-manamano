/* eslint-disable import/prefer-default-export */

import styled from 'styled-components/native';

export const RedText = styled.Text<{ font: any }>`
  color: #ef4036;
  font-family: ${(prop) => prop.font};
  text-align: justify;
  font-size: 14px;
`;
export const SemiBoldRedText = styled.Text<{ font: any }>`
  color: #ef4036;
  font-family: ${(prop) => prop.font};
  text-align: justify;
  font-size: 14px;
`;
