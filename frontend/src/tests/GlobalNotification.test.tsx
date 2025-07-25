import React from 'react';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import GlobalNotificationPage from '../pages/GlobalNotificationPage/GlobalNotificationPage';
import Toast from 'react-native-toast-message';

// MOCKS

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

// Mocka o Toast como um componente que nem vai renderizar na tela direito pois o
// jest encrenca um pouco com isso. So esperamos que ele seja chamado com as
// mensagens corretas
jest.mock('react-native-toast-message', () => {
  const MockToast = (props: any) => <></>;
  MockToast.show = jest.fn();
  return {
    __esModule: true,
    default: MockToast,
  };
});

jest.mock('../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    params: { id: 'mock-id' },
  }),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

const mockedStorage = storage as jest.Mocked<typeof storage>;
const mockedApi = api as jest.Mocked<typeof api>;

describe('GlobalNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'admin-123';
      if (key === 'accessToken') return 'fake-token';
      return undefined;
    });
  });

  it('Deve renderizar a tela corretamente', () => {
    const { getByText, getByLabelText } = render(
      <GlobalNotificationPage navigation={{ goBack: mockGoBack }} />,
    );

    expect(getByText('Comunicado')).toBeTruthy();
    expect(getByLabelText('Criar Comunicado')).toBeTruthy();
    expect(getByText('Publicar')).toBeTruthy();
  });

  it('deve mostrar uma mensagem de erro se o campo estiver vazio ao submeter', async () => {
    const { getByText, findByText } = render(
      <GlobalNotificationPage navigation={{ goBack: mockGoBack }} />,
    );

    fireEvent.press(getByText('Publicar'));

    const errorMessage = await findByText('Campo obrigatório');
    expect(errorMessage).toBeTruthy();
  });

  it('deve enviar a notificação com sucesso', async () => {
    // inicializa os fake timers para passar o tempo apenas quando mandarmos
    // serve para testarmos o setInterval de 500
    jest.useFakeTimers();
    const { getByText, getByLabelText } = render(
      <GlobalNotificationPage navigation={{ goBack: mockGoBack }} />,
    );

    const inputText = 'Este é um comunicado de teste.';
    const prompt = getByLabelText('Criar Comunicado');
    fireEvent.changeText(prompt, inputText);

    fireEvent.press(getByText('Publicar'));

    // aguarda e verifica se a API foi chamada corretamente
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/notifications/global',
        {
          type: 'WARNING',
          senderId: 'admin-123',
          body: inputText,
        },
        {
          headers: {
            Authorization: 'Bearer fake-token',
          },
        },
      );
    });

    // verifica se o toast de sucesso foi chamado
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Comunicado enviado com sucesso!',
    });

    // verifica se a navegação de volta foi chamada (usamos fake timers para o setTimeout)
    jest.advanceTimersByTime(500);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('deve mostrar uma mensagem de erro se a API falhar', async () => {
    // simula uma falha na chamada da API
    mockedApi.post.mockRejectedValueOnce(new Error('Network Error'));

    const { getByText, getByLabelText } = render(
      <GlobalNotificationPage navigation={{ goBack: mockGoBack }} />,
    );

    const prompt = getByLabelText('Criar Comunicado');
    const botaoEnvio = getByText('Publicar');
    fireEvent.changeText(prompt, 'Texto de teste');
    fireEvent.press(botaoEnvio);

    // aguarda e verifica se o toast de erro foi chamado
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro ao enviar comunicado. Tente novamente mais tarde.',
      });
    });

    // garante que não navegou para a tela anterior
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
