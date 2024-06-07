/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const InputTextContainer = styled.View`
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 5px;
  height: fit-content;
`;

export const InputTextIconInputContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 52px;
  border: solid 1.5px #5e6366;
  border-radius: 10px;
  padding: 15px;
  gap: 5px;
`;

export const InputText = styled.TextInput`
  width: 100%;
  height: 35px;
  background-color: transparent;
  border: none;
  border-radius: 5px;
  outline-color: transparent;
  outline-width: 1px;
  padding: 5px;
  color: #5e6366;
`;

export const InputTextIcon = styled.Image`
  display: flex;
  flex-direction: row;
`;

export const InputTextIconContainer = styled.TouchableOpacity<{ isPassword?: string }>`
  display: ${(prop) => (prop.isPassword ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
`;

export const LabelInputText = styled.Text`
  color: #5e6366;
  font-size: 12px;
  font-weight: 600;
`;
