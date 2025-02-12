/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const CategoryEditGroupContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  width: 100px;
  height: 35px;
  background-color: #e8e8e8;
  justify-content: center;
  padding: 5px 20px 5px 20px;
  align-items: center;
  border-radius: 20px;
  gap: 3px;
`;

export const CategoryIcon = styled.Image<{ noIcon?: any }>`
  display: ${(prop) => (prop.noIcon ? 'none' : 'flex')};
  width: 24px;
`;
