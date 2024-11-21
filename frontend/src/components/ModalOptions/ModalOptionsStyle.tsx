/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ModalOptionsContainer = styled.View`
  display: flex;
  position: absolute;
  flex-direction: column;
  gap: 6px;
  width: 130px;
  height: 100px;
  background-color: #f2f6fa;
  box-shadow: 0px 6px 9px rgba(33, 33, 33, 0.193);
  border-radius: 15px;
  padding: 8px;
  right: 32px;
  top: 10px;
  z-index: 5;
`;

export const ModalOptionsOptionsContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 2px;
  padding: 2px;
`;

export const ModalOptionsOptionsText = styled.Text<{ font: any; color: any; size: any }>`
  font-family: ${(prop) => prop.font};
  size: ${(prop) => prop.size};
  color: ${(prop) => prop.color};
`;
