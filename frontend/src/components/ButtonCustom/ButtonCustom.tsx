/* eslint-disable global-require */
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { ButtonContainer, ButtonText } from './ButtonStyle';

type ButtonCustomProps = {
  backColor?: string;
  fontColor?: string;
  text: string;
  onPress?: () => void;
  border?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  loadingColor?: string;
  accessibilityLabel?: string;
};

export default function ButtonCustom({
  backColor,
  fontColor,
  text,
  onPress,
  border,
  leftIcon,
  rightIcon,
  testID,
  disabled,
  loading = false,
  loadingText,
  loadingColor,
  accessibilityLabel,
}: ButtonCustomProps) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return undefined;
  }

  const isDisabled = disabled || loading;
  const label = loading ? loadingText || text : text;

  return (
    <ButtonContainer
      backgroundColor={backColor}
      onPress={isDisabled ? undefined : onPress}
      border={border}
      testID={testID}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator
          color={loadingColor || fontColor}
          testID={testID ? `${testID}-loading` : 'button-loading'}
        />
      ) : (
        leftIcon
      )}
      <ButtonText accessibilityLabel={label} fontColor={fontColor} fontFamily="inter-bold">
        {label}
      </ButtonText>
      {loading ? null : rightIcon}
    </ButtonContainer>
  );
}
