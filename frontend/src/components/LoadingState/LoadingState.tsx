import React from 'react';
import { ActivityIndicator } from 'react-native';
import { LoadingContainer, LoadingText } from './LoadingStateStyle';

type LoadingStateProps = {
  text?: string;
  inline?: boolean;
  testID?: string;
};

export default function LoadingState({
  text = 'Carregando...',
  inline = false,
  testID = 'loading-state',
}: LoadingStateProps) {
  return (
    <LoadingContainer $inline={inline} testID={testID}>
      <ActivityIndicator size="large" color="#EF4036" testID={`${testID}-indicator`} />
      {text ? <LoadingText>{text}</LoadingText> : null}
    </LoadingContainer>
  );
}
