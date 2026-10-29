/* eslint-disable global-require */
import React, { useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  ButtonContainer,
  ButtonText,
} from './ButtonStyle';

type ButtonCustomProps = {
  backColor?: string;
  fontColor?: string;
  text: string;
  onPress: () => void | Promise<void>;
  border?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
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
}: ButtonCustomProps) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });

  const isSubmitting = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setIsLoading(true);

    try {
      await onPress();
    } catch (error) {
      console.error('Erro ao executar ação do botão:', error);
    } finally {
      // Libera o botão independentemente do resultado.
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ButtonContainer
      backgroundColor={backColor}
      onPress={handlePress}
      border={border}
      testID={testID}
      disabled={isLoading}
    >
      {leftIcon}

      <ButtonText
        accessibilityLabel={text}
        fontColor={fontColor}
        fontFamily="inter-semiBold"
      >
        {isLoading ? 'Aguarde...' : text}
      </ButtonText>

      {rightIcon}
    </ButtonContainer>
  );
}