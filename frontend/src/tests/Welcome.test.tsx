import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import Welcome from '../pages/Welcome/Welcome';
import api from '../services/api';

jest.mock('../services/api');

jest.mock('expo-application', () => ({
  nativeBuildVersion: '1',
}));

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ isLoading: false, loggedId: mockLoggedId }),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

let mockLoggedId: string | null = null;

const mockedApi = api as jest.Mocked<typeof api>;

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../components/ButtonCustom/ButtonCustom', () => {
  return ({ onPress, text }: { onPress: () => void; text: string }) => (
    <TouchableOpacity onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
});

const mockNavigation = jest.fn();
const mockReset = jest.fn();
const navigation = { navigate: mockNavigation, reset: mockReset };

describe('Welcome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedId = null;
    mockedApi.get.mockResolvedValue({ data: { update: false } });
  });

  it('Deve renderizar corretamente e mostrar os botões de sign-in e sign-up', () => {
    const { getByText } = render(<Welcome navigation={navigation} />);

    expect(getByText('Cadastre-se')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();

    expect(mockNavigation).not.toHaveBeenCalled();
  });

  it('Deve navegar para pagina de SignUp ao clicar no botao de cadastrar', () => {
    const { getByText } = render(<Welcome navigation={navigation} />);

    fireEvent.press(getByText('Cadastre-se'));

    expect(mockNavigation).toHaveBeenCalledWith('SignUp');
  });

  it('Deve navegar para a pagina de SignIn ao clicar no botão de entrar', () => {
    const { getByText } = render(<Welcome navigation={navigation} />);

    fireEvent.press(getByText('Entrar'));

    expect(mockNavigation).toHaveBeenCalledWith('SignIn');
  });

  it('Deve redirecionar o usuario para a pagina Home se ele ja estiver loggado', async () => {
    mockLoggedId = 'fake-id';

    render(<Welcome navigation={navigation} />);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });
});
