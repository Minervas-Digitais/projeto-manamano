import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ButtonCustom from '../components/ButtonCustom/ButtonCustom';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

describe('ButtonCustom', () => {
  it('renderiza o texto e dispara onPress quando habilitado', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ButtonCustom text="Enviar" onPress={onPress} testID="submit-button" />,
    );

    fireEvent.press(getByText('Enviar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exibe spinner e texto de carregamento durante o loading', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId, queryByText } = render(
      <ButtonCustom
        text="Enviar"
        loadingText="Enviando..."
        loading
        onPress={onPress}
        testID="submit-button"
      />,
    );

    expect(getByText('Enviando...')).toBeTruthy();
    expect(queryByText('Enviar')).toBeNull();
    expect(getByTestId('submit-button-loading')).toBeTruthy();
  });

  it('bloqueia novos acionamentos enquanto estiver carregando', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <ButtonCustom
        text="Enviar"
        loadingText="Enviando..."
        loading
        onPress={onPress}
        testID="submit-button"
      />,
    );

    fireEvent.press(getByText('Enviando...'));
    fireEvent.press(getByTestId('submit-button'));

    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId('submit-button').props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });

  it('respeita a prop disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ButtonCustom text="Enviar" onPress={onPress} disabled testID="submit-button" />,
    );

    fireEvent.press(getByText('Enviar'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
