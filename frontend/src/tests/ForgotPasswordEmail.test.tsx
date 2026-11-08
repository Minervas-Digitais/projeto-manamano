import React from 'react';
import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import ForgotPasswordEmail from '../pages/ForgotPassword/ForgotPasswordEmail';
import { clearResendCooldown, registerCodeSent } from '../hooks/useResendCooldown';

const mockedNavigate = jest.fn();
let mockedRouteParams: { email?: string } | undefined = undefined;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: mockedRouteParams,
  }),
}));

jest.mock('../services/api');
const mockPost = api.post as jest.Mock;

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

describe('ForgotPasswordEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearResendCooldown();
    mockedRouteParams = undefined;
  });

  it('deve renderizar o texto instrucional, campo de e-mail e botão', () => {
    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    expect(
      getByText('Digite o e-mail da sua conta. Enviaremos um código de recuperação.'),
    ).toBeTruthy();
    expect(getByLabelText('E-mail')).toBeTruthy();
    expect(getByText('Enviar')).toBeTruthy();
  });

  it('deve preencher o e-mail caso venha via parâmetro de rota', () => {
    mockedRouteParams = { email: 'preenchido@email.com' };
    const { getByLabelText } = render(<ForgotPasswordEmail />);

    expect(getByLabelText('E-mail').props.value).toBe('preenchido@email.com');
  });

  it('deve exibir mensagem de campo obrigatório se tentar enviar vazio', async () => {
    const { getByText, findByText } = render(<ForgotPasswordEmail />);

    fireEvent.press(getByText('Enviar'));

    expect(await findByText('Campo obrigatório')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de e-mail inválido se o formato estiver incorreto', async () => {
    const { getByText, getByLabelText, findByText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'emailinvalido');
    fireEvent.press(getByText('Enviar'));

    expect(await findByText('E-mail inválido')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve submeter o e-mail com sucesso e navegar para ForgotPasswordCode', async () => {
    mockPost.mockResolvedValueOnce({
      data: { message: 'Código enviado' },
    });

    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), '  usuario@email.com  ');
    fireEvent.press(getByText('Enviar'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'usuario@email.com',
      });
      expect(mockedNavigate).toHaveBeenCalledWith('ForgotPasswordCode', {
        email: 'usuario@email.com',
      });
    });
  });

  it('deve navegar direto para a tela de código se já houver cooldown ativo para o e-mail', async () => {
    registerCodeSent('usuario@email.com');

    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@email.com');
    fireEvent.press(getByText('Enviar'));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith('ForgotPasswordCode', {
        email: 'usuario@email.com',
      });
    });
  });

  it('deve exibir toast de erro se a API responder com status 429', async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 429 },
    });

    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@email.com');
    fireEvent.press(getByText('Enviar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        }),
      );
    });
  });

  it('deve exibir toast de conexão quando a API não responder', async () => {
    mockPost.mockRejectedValueOnce({ isAxiosError: true });

    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@email.com');
    fireEvent.press(getByText('Enviar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Não foi possível conectar. Verifique sua internet e tente novamente.',
        }),
      );
    });
  });

  it('deve exibir toast de indisponibilidade quando a API responder com 5xx', async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 503 },
    });

    const { getByText, getByLabelText } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@email.com');
    fireEvent.press(getByText('Enviar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Recuperação de senha indisponível no momento. Tente mais tarde.',
        }),
      );
    });
  });

  it('deve enviar apenas uma requisição ao confirmar rapidamente duas vezes', async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { getByLabelText, getByTestId } = render(<ForgotPasswordEmail />);

    fireEvent.changeText(getByLabelText('E-mail'), 'usuario@email.com');
    fireEvent.press(getByTestId('forgot-email-submit'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByTestId('forgot-email-submit'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPost).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest({ data: { message: 'Código enviado' } });
    });
  });
});
