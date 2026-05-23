import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

export const ADMPageContainer = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding-bottom: 10px;
`;

export const ADMBlueBackground = styled.View`
  background-color: #170e49;
  flex: 1;
`;

export const ADMTextContainer = styled.View`
  padding-left: ${width * 0.0581}px;
  top: ${height * 0.09}px;
`;

export const ADMPageTextContainer = styled.View`
  padding-left: ${width * 0.0581}px;
  padding-top: 25px;
  margin-bottom: 20px;
`;
