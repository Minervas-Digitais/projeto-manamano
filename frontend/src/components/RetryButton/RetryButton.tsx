import React from 'react';
import { RetryContainer, RetryText } from './RetryButtonStyle';

type RetryButtonProps = {
  onPress: () => void;
  text?: string;
  testID?: string;
};

export default function RetryButton({
  onPress,
  text = 'Tentar novamente',
  testID = 'retry-button',
}: RetryButtonProps) {
  return (
    <RetryContainer onPress={onPress} testID={testID}>
      <RetryText>{text}</RetryText>
    </RetryContainer>
  );
}
