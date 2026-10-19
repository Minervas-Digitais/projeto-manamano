import styled from 'styled-components/native';

// eslint-disable-next-line import/prefer-default-export
export const SignUpForm = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  keyboardShouldPersistTaps: 'handled',
}))`
  width: 100%;
  height: 100%;
  padding: 25px;
  padding-top: 45px;
`;
export const SignUpInputContainer = styled.View`
  width: 100%;
  gap: 15px;
`;

export const SignUpContainer = styled.View`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #f2f6fa;
`;
