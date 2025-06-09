/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const AboutPage = styled.View`
  display: flex;
  background-color: #f2f6fa;
  flex: 1;
`;

export const AboutContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    padding: 25,
    gap: 20,
  },
}))`
  background-color: #f2f6fa;
`;
