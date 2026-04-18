import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import api from '../services/api';
import SignIn from '../pages/SignIn/SignIn';
import Toast from 'react-native-toast-message';

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    goBack: jest.fn(),
  }),
}));
(global as any).alert = jest.fn();
jest.mock('../services/api');

jest.mock('../hooks/useNotification', () => ({
  registerForPushNotificationsAsync: jest.fn(async () => null),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

describe('SignIn', () => {
  const apiPostMock = api.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Deve renderizar todos os campos do formulario e o botao', () => {
    const { getByText, getByLabelText } = render(
      <SignIn navigation={{ navigate: mockedNavigate }} />,
    );
    expect(getByLabelText('E-mail')).toBeTruthy();
    expect(getByLabelText('Senha')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });
  it('Deve permitir o envio do formulário com dados válidos', async () => {
    const { getByLabelText, getByText } = render(
      <SignIn navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('E-mail'), 'jorge@gmail.com');
    fireEvent.changeText(getByLabelText('Senha'), 'senha123');
    apiPostMock.mockResolvedValueOnce({
      data: {
        accessToken: 'fake-token',
        loggedId: '123',
      },
    });
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/login', {
        email: 'jorge@gmail.com',
        password: 'senha123',
      });
      expect(mockedNavigate).toHaveBeenCalledWith('Home');
    });
  });
  it('Deve exibir mensagem de erro se os campos estiverem vazios', async () => {
    const { getByText, queryAllByText } = render(
      <SignIn navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      const errorMessages = queryAllByText('Campo obrigatório');
      expect(errorMessages.length).toBeGreaterThanOrEqual(2);
    });
  });
  it('Deve exibir alerta se e-mail ou senha estiverem incorretos', async () => {
    const { getByLabelText, getByText } = render(
      <SignIn navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@invalido.com');
    fireEvent.changeText(getByLabelText('Senha'), 'senhaerrada');

    apiPostMock.mockResolvedValueOnce({
      data: {},
    });

    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/login', {
        email: 'usuario@invalido.com',
        password: 'senhaerrada',
      });

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro ao entrar',
        text2: 'E-mail ou senha incorretos',
      });
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});




