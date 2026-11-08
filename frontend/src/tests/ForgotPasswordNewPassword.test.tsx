import React from 'react';
import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import ForgotPasswordNewPassword from '../pages/ForgotPassword/ForgotPasswordNewPassword';

const mockedReset = jest.fn();
let mockedRouteParams: { resetToken?: string } = { resetToken: 'mock-reset-token-xyz' };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    reset: mockedReset,
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

describe('ForgotPasswordNewPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRouteParams = { resetToken: 'mock-reset-token-xyz' };
  });

  it('deve renderizar os campos de senha e confirmação e o botão', () => {
    const { getByLabelText, getByText } = render(<ForgotPasswordNewPassword />);

    expect(getByLabelText('Digite a nova senha')).toBeTruthy();
    expect(getByLabelText('Confirme a nova senha')).toBeTruthy();
    expect(getByText('Confirmar')).toBeTruthy();
  });

  it('deve exibir mensagem de campo obrigatório ao submeter vazio', async () => {
    const { getByText, findAllByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.press(getByText('Confirmar'));

    const errors = await findAllByText('Campo obrigatório');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve exibir erro para senha com menos de 8 caracteres', async () => {
    const { getByLabelText, getByText, findByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), '1234567');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), '1234567');
    fireEvent.press(getByText('Confirmar'));

    expect(await findByText('A senha deve ter no mínimo 8 caracteres')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve exibir erro para senha com mais de 72 caracteres', async () => {
    const { getByLabelText, getByText, findByText } = render(<ForgotPasswordNewPassword />);
    const longPassword = 'a'.repeat(73);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), longPassword);
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), longPassword);
    fireEvent.press(getByText('Confirmar'));

    expect(await findByText('A senha deve ter no máximo 72 caracteres')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve exibir erro se as senhas não coincidirem', async () => {
    const { getByLabelText, getByText, findByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha123');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'outraSenha123');
    fireEvent.press(getByText('Confirmar'));

    expect(await findByText('Senhas não coincidem')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve redefinir a senha com sucesso, resetar a navegação para o login e exibir toast', async () => {
    mockPost.mockResolvedValueOnce({
      data: { message: 'Senha redefinida com sucesso.' },
    });

    const { getByLabelText, getByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha123');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha123');
    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        resetToken: 'mock-reset-token-xyz',
        newPassword: 'novaSenha123',
      });
      expect(mockedReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text2: 'Senha redefinida com sucesso. Faça login com a nova senha.',
        }),
      );
    });
  });

  it('deve redirecionar para a tela de e-mail com toast quando o resetToken for inválido ou expirado', async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Sua solicitação expirou. Solicite um novo código.' },
      },
    });

    const { getByLabelText, getByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha123');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha123');
    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Sua solicitação expirou. Solicite um novo código.',
        }),
      );
      expect(mockedReset).toHaveBeenCalledWith({
        index: 1,
        routes: [{ name: 'SignIn' }, { name: 'ForgotPasswordEmail' }],
      });
    });
  });

  it('deve redirecionar para o início do fluxo quando o resetToken não vier nos params', async () => {
    mockedRouteParams = {};

    render(<ForgotPasswordNewPassword />);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Solicitação inválida. Solicite um novo código.',
        }),
      );
      expect(mockedReset).toHaveBeenCalledWith({
        index: 1,
        routes: [{ name: 'SignIn' }, { name: 'ForgotPasswordEmail' }],
      });
    });
  });

  it('deve exibir a mensagem do backend e não resetar a navegação em um 400 que não seja token expirado', async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'A nova senha deve ter no mínimo 8 caracteres.' },
      },
    });

    const { getByLabelText, getByText } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha123');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha123');
    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'A nova senha deve ter no mínimo 8 caracteres.',
        }),
      );
      expect(mockedReset).not.toHaveBeenCalled();
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

    const { getByLabelText, getByTestId } = render(<ForgotPasswordNewPassword />);

    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha123');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha123');
    fireEvent.press(getByTestId('forgot-new-password-submit'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByTestId('forgot-new-password-submit'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPost).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest({ data: { message: 'Senha redefinida com sucesso.' } });
    });
  });
});
