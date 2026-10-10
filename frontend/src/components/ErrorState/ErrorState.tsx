import React from 'react';
import { ErrorContainer, ErrorText } from './ErrorStateStyle';
import RetryButton from '../RetryButton/RetryButton';

type ErrorStateProps = {
  text?: string;
  onRetry: () => void;
  retryText?: string;
  inline?: boolean;
  testID?: string;
};

export default function ErrorState({
  text = 'Não foi possível carregar os dados.',
  onRetry,
  retryText,
  inline = false,
  testID = 'error-state',
}: ErrorStateProps) {
  return (
    <ErrorContainer $inline={inline} testID={testID}>
      <ErrorText>{text}</ErrorText>
      <RetryButton onPress={onRetry} text={retryText} />
    </ErrorContainer>
  );
}
