import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import ForgotPasswordCode from '../pages/ForgotPassword/ForgotPasswordCode';
import { clearResendCooldown, registerCodeSent } from '../hooks/useResendCooldown';

const mockedReplace = jest.fn();
const mockedGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    replace: mockedReplace,
    goBack: mockedGoBack,
  }),
  useRoute: () => ({
    params: { email: 'usuario@email.com' },
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

describe('ForgotPasswordCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearResendCooldown();
  });

  it('deve renderizar os textos, as caixas do código e o botão confirmar inicialmente desabilitado', () => {
    const { getByText, getByTestId } = render(<ForgotPasswordCode />);

    expect(getByText(/Confira seu e-mail/i)).toBeTruthy();
    expect(getByText('usuario@email.com')).toBeTruthy();
    expect(getByText('Digite o código de 6 dígitos')).toBeTruthy();

    const submitButton = getByTestId('forgot-code-submit');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('deve habilitar o botão confirmar somente ao digitar os 6 dígitos', () => {
    const { getByTestId } = render(<ForgotPasswordCode />);
    const hiddenInput = getByTestId('forgot-code-input');
    const submitButton = getByTestId('forgot-code-submit');

    fireEvent.changeText(hiddenInput, '12345');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.changeText(hiddenInput, '123456');
    expect(submitButton.props.accessibilityState?.disabled).toBe(false);
  });

  it('deve submeter o código com sucesso e navegar via replace com o resetToken', async () => {
    mockPost.mockResolvedValueOnce({
      data: { resetToken: 'mock-reset-token-123' },
    });

    const { getByTestId, getByText } = render(<ForgotPasswordCode />);

    fireEvent.changeText(getByTestId('forgot-code-input'), '123456');
    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/verify-reset-code', {
        email: 'usuario@email.com',
        code: '123456',
      });
      expect(mockedReplace).toHaveBeenCalledWith('ForgotPasswordNewPassword', {
        resetToken: 'mock-reset-token-123',
      });
    });
  });

  it('deve exibir toast e limpar o código em caso de código inválido', async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Código inválido ou expirado.' },
      },
    });

    const { getByTestId, getByText } = render(<ForgotPasswordCode />);
    const hiddenInput = getByTestId('forgot-code-input');

    fireEvent.changeText(hiddenInput, '654321');
    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Código inválido ou expirado.',
        }),
      );
      expect(hiddenInput.props.value).toBe('');
    });
  });

  it('deve exibir toast de aviso caso o usuário tente reenviar com o timer ativo', () => {
    registerCodeSent('usuario@email.com');

    const { getByTestId } = render(<ForgotPasswordCode />);

    fireEvent.press(getByTestId('forgot-resend-button'));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        text2: 'Espere um pouco antes de solicitar o código novamente.',
      }),
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve permitir o reenvio quando o timer não estiver ativo', async () => {
    mockPost.mockResolvedValueOnce({ data: { message: 'Novo código enviado' } });

    const { getByTestId } = render(<ForgotPasswordCode />);

    fireEvent.press(getByTestId('forgot-resend-button'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'usuario@email.com',
      });
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text2: 'Enviamos um novo código para o seu e-mail.',
        }),
      );
    });
  });

  it('deve exibir mensagem de limite atingido quando estourar os reenvios permitidos', () => {
    // Registra 6 envios para simular limite atingido
    for (let i = 0; i < 6; i++) {
      registerCodeSent('usuario@email.com');
    }

    const { getByText, queryByTestId } = render(<ForgotPasswordCode />);

    expect(getByText('Limite de reenvios atingido. Tente novamente mais tarde.')).toBeTruthy();
    expect(queryByTestId('forgot-resend-button')).toBeNull();
  });
});
