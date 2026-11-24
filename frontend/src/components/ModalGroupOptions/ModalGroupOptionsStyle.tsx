/* eslint-disable import/prefer-default-export */

import styled from 'styled-components/native';

export const ModalGroupOptionsContainer = styled.View`
  display: flex;

  position: absolute;

  flex-direction: column;

  gap: 6px;

  width: 190px;

  min-height: 90px;

  background-color: #f2f6fa;

  border-radius: 15px;

  padding: 8px;

  right: 32px;

  top: -20px;

  z-index: 100;

  elevation: 6;
`;

export const ModalGroupOptionsOptionContainer = styled.TouchableOpacity`
  display: flex;

  flex-direction: row;

  align-items: center;

  width: 100%;

  gap: 6px;

  padding: 2px;
`;

export const ModalGroupOptionsText = styled.Text<{
  font: any;
  color: any;
  size: any;
}>`
  font-family: ${(prop) => prop.font};

  font-size: ${(prop) => prop.size};

  color: ${(prop) => prop.color};

  flex-shrink: 1;
`;

export const ModalGroupOptionsInfo = styled.Text`
  font-family: inter-regular;

  font-size: 11px;

  color: #8f8f8f;

  padding: 0 2px;

  flex-shrink: 1;
`;
