/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const CategoryButtonContainer = styled.TouchableOpacity<{ selected?: any }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 105px;
  height: 30px;
  background-color: ${(prop) => (prop.selected ? '#FFA8A6' : '#E8E8E8')};
  border-radius: 20px;
  padding: 2px;
`;
