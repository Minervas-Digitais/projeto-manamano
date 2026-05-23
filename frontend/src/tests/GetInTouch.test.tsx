import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import api from '../services/api';
import storage from '../services/secureStorage';
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

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

jest.mock('../assets/arrow-icon.svg', () => 'ArrowIcon');

jest.spyOn(Alert, 'alert');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as any;

describe('GetInTouch', () => {
  const mockLoggedUser = () => {
    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-123';
      return null;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Não deve renderizar o formulário se o usuário não estiver logado', () => {
    mockedStorage.getItem.mockResolvedValue(undefined);

    const { queryByText } = render(<GetInTouch />);

    expect(queryByText('Assunto')).toBeNull();
    expect(queryByText('Enviar')).toBeNull();
  });

  it('Deve renderizar o formulário quando logado', async () => {
    mockLoggedUser();

    const { getByText, getByLabelText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Assunto')).toBeTruthy();
      expect(getByLabelText('Mensagem')).toBeTruthy();
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    expect(getByText('Fale Conosco')).toBeTruthy();
  });

  it('Deve exibir mensagens de erro ao tentar submeter com campos vazios', async () => {
    mockLoggedUser();

    const { getByLabelText, findAllByText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('Enviar'));

    const errorMessages = await findAllByText('Campo obrigatório');
    expect(errorMessages).toHaveLength(2);
  });

  it('Deve submeter o formulário com sucesso', async () => {
    mockLoggedUser();
    mockedApi.post.mockResolvedValue({ data: { message: 'Success' } });

    const { getByLabelText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Assunto')).toBeTruthy();
      expect(getByLabelText('Mensagem')).toBeTruthy();
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    const subjectInput = getByLabelText('Assunto');
    const messageInput = getByLabelText('Mensagem');

    fireEvent.changeText(subjectInput, 'Problema com o App');
    fireEvent.changeText(messageInput, 'O botão principal não funciona.');
    fireEvent.press(getByLabelText('Enviar'));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/mail',
        {
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
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLoggedUser();
    mockedApi.post.mockRejectedValue(new Error('Network Error'));

    const { getByLabelText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Assunto')).toBeTruthy();
      expect(getByLabelText('Mensagem')).toBeTruthy();
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    const subjectInput = getByLabelText('Assunto');
    const messageInput = getByLabelText('Mensagem');

    fireEvent.changeText(subjectInput, 'Dúvida');
    fireEvent.changeText(messageInput, 'Qual o horário de atendimento?');
    fireEvent.press(getByLabelText('Enviar'));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalled();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro ao enviar mensagem. Tente novamente mais tarde.',
    );
  });
});
