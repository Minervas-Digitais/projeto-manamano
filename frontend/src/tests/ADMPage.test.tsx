/* eslint-disable no-console */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ADMPage from '../pages/ADMPage/ADMPage';

// ---- Mocks ------------------------------------------------------------------

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('../../assets/white-group.svg', () => 'GroupIcon');
jest.mock('../../assets/white-megaphone.svg', () => 'MegaphoneIcon');
jest.mock('../../assets/white-gear.svg', () => 'GearIcon');
jest.mock('../../assets/white-MG.svg', () => 'SearchIcon');

// -----------Testes-----------------------------------------------------------------

describe('ADMPage', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('An update to') || msg.includes('inside a test was not wrapped in act')) {
          return;
        }
      }

      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizar os textos e  os botões', () => {
    const { getByText } = render(<ADMPage />);
    const { debug } = render(<ADMPage />);

    expect(getByText('Olá,')).toBeTruthy();
    expect(getByText('Administrador!')).toBeTruthy();
    expect(getByText('Ações')).toBeTruthy();

    expect(getByText('Pesquisar')).toBeTruthy();
    expect(getByText('Criar Grupo')).toBeTruthy();
    expect(getByText('Comunicados')).toBeTruthy();
    expect(getByText('Configurações')).toBeTruthy();
    debug();
  });
  it('navega para "Search" ao tocar em "Pesquisar"', () => {
    const { getByText } = render(<ADMPage />);

    fireEvent.press(getByText('Pesquisar'));
    expect(mockedNavigate).toHaveBeenCalledWith('Search');
  });

  it('navega para "CreateGroup" ao tocar em "Criar Grupo"', () => {
    const { getByText } = render(<ADMPage />);
    fireEvent.press(getByText('Criar Grupo'));
    expect(mockedNavigate).toHaveBeenCalledWith('CreateGroup');
  });

  it('navega para "Notification" ao tocar em "Comunicados"', () => {
    const { getByText } = render(<ADMPage />);
    fireEvent.press(getByText('Comunicados'));
    expect(mockedNavigate).toHaveBeenCalledWith('Notification');
  });

  it('navega para "Config" ao tocar em "Configurações"', () => {
    const { getByText } = render(<ADMPage />);
    fireEvent.press(getByText('Configurações'));
    expect(mockedNavigate).toHaveBeenCalledWith('Config');
  });
});
