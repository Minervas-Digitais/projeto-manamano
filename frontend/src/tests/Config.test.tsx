import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Config from '../pages/Configuration/Configuration';

// MOCKS
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    goBack: jest.fn(),
  }),
}));

jest.mock('../services/api');

jest.mock('expo-font', () => ({
  useFonts: () => [true], // simula q as fontes carregaram
}));

(global as any).alert = jest.fn();

describe('Config Page', () => {
  it('deve renderizar corretamente', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Config />
      </NavigationContainer>,
    );

    expect(getByText('Configurações')).toBeTruthy();
    expect(getByText('Notificações')).toBeTruthy();
    expect(getByText('Sobre')).toBeTruthy();
    expect(getByText('Mudar senha')).toBeTruthy();
  });

  it('deve navegar para ConfigNotification ao clicar em Notificações', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Config />
      </NavigationContainer>,
    );
    fireEvent.press(getByText('Notificações'));
    expect(mockedNavigate).toHaveBeenCalledWith('ConfigNotification');
  });

  it('deve navegar para About ao clicar em Sobre', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Config />
      </NavigationContainer>,
    );
    fireEvent.press(getByText('Sobre'));
    expect(mockedNavigate).toHaveBeenCalledWith('About');
  });

  it('deve navegar para ChangePassword ao clicar em Mudar senha', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Config />
      </NavigationContainer>,
    );
    fireEvent.press(getByText('Mudar senha'));
    expect(mockedNavigate).toHaveBeenCalledWith('ChangePassword');
  });
});
