/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DeleteConfirmationContainer = styled.View<{ display: any }>`
  display: ${(prop) => (prop.display ? 'flex' : 'none')};
  width: ${width}px;
  height: ${height}px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 234082398;
  background-color: #19191937;
  justify-content: center;
  align-items: center;
`;

export const DeleteConfirmationCardContainer = styled.View`
  display: flex;
  width: 200px;
  height: 100px;
  background-color: #f2f6fa;
  border-radius: 15px;
  padding: 1px 20px 1px 20px;
  justify-content: center;
  align-items: center;
  elevation: 4;
  shadow-color: #272727;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
`;

export const DeleteConfirmationButtonContainer = styled.View`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 10px;
`;

export const DeleteConfirmationButton = styled.TouchableOpacity`
  width: auto;
  height: auto;
`;
