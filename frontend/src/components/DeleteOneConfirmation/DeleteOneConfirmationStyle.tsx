/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const DeleteConfirmationContainer = styled.View<{ display: any }>`
  display: ${(prop) => (prop.display ? 'flex' : 'none')};
  width: 100vw;
  height: 100vh;
  position: absolute;
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
  box-shadow: 0 4px 8px rgba(39, 39, 39, 0.2);
`;

export const DeleteConfirmationButtonContainer = styled.View`
  width: 100%;
  height: max-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 10px;
`;
export const DeleteConfirmationButton = styled.TouchableOpacity`
  width: max-content;
  height: max-content;
`;
