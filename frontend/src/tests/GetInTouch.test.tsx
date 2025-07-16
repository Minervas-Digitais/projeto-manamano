import React from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import GetInTouch from '../pages/GetInTouch/GetInTouch';

// MOCKS
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: jest.fn(),
      navigate: jest.fn(),
    }),
  };
});

jest.mock('../services/api');

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

jest.mock('../assets/arrow-icon.svg', () => 'ArrowIcon');

jest.spyOn(Alert, 'alert');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

describe('GetInTouch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Não deve renderizar o formulário se o usuário não estiver logado', () => {
    mockedStorage.getString.mockReturnValue(undefined);

    const { queryByText } = render(<GetInTouch />);

    expect(queryByText('Assunto')).toBeNull();
    expect(queryByText('Enviar')).toBeNull();
  });

  it('Deve renderizar o formulário e buscar dados do usuário quando logado', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-123';
      return undefined;
    });

    mockedApi.get.mockResolvedValue({ data: {} });

    const { getByText, getByLabelText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/user/user-123', {
        headers: {
          Authorization: 'Bearer fake-token',
        },
      });
    });

    expect(getByText('Fale Conosco')).toBeTruthy();
    expect(getByLabelText('Assunto')).toBeTruthy();
    expect(getByLabelText('Mensagem')).toBeTruthy();
    expect(getByText('Enviar')).toBeTruthy();
  });

  it('Deve exibir mensagens de erro ao tentar submeter com campos vazios', async () => {
    mockedStorage.getString.mockReturnValue('fake-data');

    const { getByText, findAllByText } = render(<GetInTouch />);

    const sendButton = getByText('Enviar');

    fireEvent.press(sendButton);

    const errorMessages = await findAllByText('Campo obrigatório');
    expect(errorMessages).toHaveLength(2);
  });

  it('Deve submeter o formulário com sucesso', async () => {
    // Arrange: Usuário logado e mock da API POST para sucesso
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-123';
      return undefined;
    });
    mockedApi.post.mockResolvedValue({ data: { message: 'Success' } });

    const { getByText, getByLabelText } = render(<GetInTouch />);

    const subjectInput = getByLabelText('Assunto');
    const messageInput = getByLabelText('Mensagem');
    const sendButton = getByText('Enviar');

    // Act: Preenche o formulário e clica em enviar
    fireEvent.changeText(subjectInput, 'Problema com o App');
    fireEvent.changeText(messageInput, 'O botão principal não funciona.');
    fireEvent.press(sendButton);

    // Assert: Espera a chamada da API e verifica os dados
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/mail',
        {
          userId: 'user-123',
          subject: 'Problema com o App',
          text: 'O botão principal não funciona.',
        },
        {
          headers: {
            Authorization: 'Bearer fake-token',
          },
        },
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith('Mensagem enviada com sucesso!');
  });

  it('Deve exibir um alerta de erro se a submissão da API falhar', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockedStorage.getString.mockReturnValue('fake-data');
    mockedApi.post.mockRejectedValue(new Error('Network Error'));

    const { getByText, getByLabelText } = render(<GetInTouch />);

    const subjectInput = getByLabelText('Assunto');
    const messageInput = getByLabelText('Mensagem');
    const sendButton = getByText('Enviar');

    fireEvent.changeText(subjectInput, 'Dúvida');
    fireEvent.changeText(messageInput, 'Qual o horário de atendimento?');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalled();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro ao enviar mensagem. Tente novamente mais tarde.',
    );
  });
});