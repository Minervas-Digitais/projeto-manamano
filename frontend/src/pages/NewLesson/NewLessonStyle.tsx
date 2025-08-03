/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

export const LinkPart = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
  gap: 20px;
  padding-bottom: 20px;
`;

export const ArchivesCardContainer = styled.View`
  gap: 15px;
  flex-direction: row;
`;

export const NewLessonContainer = styled.View`
  margin-top: ${height * 0.03}px;
  flex: 1;
  gap: 20px;
`;
