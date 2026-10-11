import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
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

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

let mockLoggedId: string | null = 'user-123';

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ loggedId: mockLoggedId }),
}));

jest.mock('../assets/arrow-icon.svg', () => 'ArrowIcon');

const mockedApi = api as jest.Mocked<typeof api>;

describe('GetInTouch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedId = 'user-123';
  });

  it('Não deve exibir o formulário se o usuário não estiver logado', () => {
    mockLoggedId = null;

    const { queryByText } = render(<GetInTouch />);

    expect(queryByText('Assunto')).toBeNull();
    expect(queryByText('Enviar')).toBeNull();

    // o formulário é renderizado, mas oculto (display: 'none')
    expect(queryByText('Assunto', { includeHiddenElements: true })).toBeTruthy();
    expect(queryByText('Enviar', { includeHiddenElements: true })).toBeTruthy();
  });

  it('Deve renderizar o formulário quando logado', async () => {
    const { getByText, getByLabelText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Assunto')).toBeTruthy();
      expect(getByLabelText('Mensagem')).toBeTruthy();
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    expect(getByText('Fale Conosco')).toBeTruthy();
  });

  it('Deve exibir mensagens de erro ao tentar submeter com campos vazios', async () => {
    const { getByLabelText, findAllByText } = render(<GetInTouch />);

    await waitFor(() => {
      expect(getByLabelText('Enviar')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('Enviar'));

    const errorMessages = await findAllByText('Campo obrigatório');
    expect(errorMessages).toHaveLength(2);
  });

  it('Deve submeter o formulário com sucesso', async () => {
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
      expect(mockedApi.post).toHaveBeenCalledWith('/mail', {
        subject: 'Problema com o App',
        text: 'O botão principal não funciona.',
      });
    });

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Mensagem enviada',
      text2: 'Sua mensagem foi enviada com sucesso!',
    });
  });

  it('Deve exibir um alerta de erro se a submissão da API falhar', async () => {
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

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Erro',
      text2: 'Não foi possível enviar a mensagem. Tente novamente mais tarde.',
    });
  });
});
