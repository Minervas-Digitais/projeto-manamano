import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Welcome from '../pages/Welcome/Welcome';
import storage from '../services/secureStorage';

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

const mockGetString = storage.getItem as jest.Mock;

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../components/ButtonCustom/ButtonCustom', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ onPress, text }: { onPress: () => void; text: string }) => (
    <TouchableOpacity onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
});

const mockNavigation = jest.fn();

describe('Welcome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve renderizar corretamente e mostrar os botões de sign-in e sign-up', () => {
    mockGetString.mockResolvedValue(null);

    const { getByText } = render(<Welcome navigation={{ navigate: mockNavigation }} />);

    expect(getByText('Cadastre-se')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();

    expect(mockNavigation).not.toHaveBeenCalled();
  });

  it('Deve navegar para pagina de SignUp ao clicar no botao de cadastrar', () => {
    mockGetString.mockResolvedValue(null);

    const { getByText } = render(<Welcome navigation={{ navigate: mockNavigation }} />);

    fireEvent.press(getByText('Cadastre-se'));

    expect(mockNavigation).toHaveBeenCalledWith('SignUp');
  });

  it('Deve navegar para a pagina de SignIn ao clicar no botão de entrar', () => {
    mockGetString.mockResolvedValue(null);

    const { getByText } = render(<Welcome navigation={{ navigate: mockNavigation }} />);

    fireEvent.press(getByText('Entrar'));

    expect(mockNavigation).toHaveBeenCalledWith('SignIn');
  });

  it('Deve redirecionar o usuario para a pagina Home se ele ja estiver loggado', async () => {
    mockGetString.mockImplementation((key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'fake-id';
      return null;
    });

    render(<Welcome navigation={{ navigate: mockNavigation }} />);

    await waitFor(() => {
      expect(mockNavigation).toHaveBeenCalledWith('Home');
    });
  });
});
