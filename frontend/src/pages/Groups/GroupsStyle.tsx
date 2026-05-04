/* eslint-disable import/prefer-default-export */
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';

export const GroupsContainer = styled.View`
  flex: 1;
`;

export const GroupsBody = styled.View`
  flex: 1;
  background-color: #f2f6fa;
  padding: 25px;
`;

export const GroupsList = styled(ScrollView)`
  width: 100%;
  background-color: #f2f6fa;
`;
