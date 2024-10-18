import React from 'react';
import { ErrorWarningContainer, ErrorWarningText } from './ErrorWarningStyle';

export default function ErrorWarning({ errorText }: any) {
  return (
    <ErrorWarningContainer>
      <ErrorWarningText>{errorText}</ErrorWarningText>
    </ErrorWarningContainer>
  );
}
