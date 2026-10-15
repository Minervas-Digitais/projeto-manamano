import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import ChangePassword from '../pages/ChangePassword/ChangePassword';
import Config from '../pages/Configuration/Configuration';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

jest.mock('../services/api');
const mockPatch = api.patch as jest.Mock;

let mockLoggedId: string | null = 'user-123';

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ loggedId: mockLoggedId }),
}));

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Config" component={Config} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

describe('ChangePassword', () => {
  beforeAll(() => {
    // ignora os erros do act e causados pelo proprio teste
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string') {
        if (
          msg.includes('An update to') ||
          msg.includes('inside a test was not wrapped in act') ||
          msg.includes('Erro ao mudar senha:')
        ) {
          return;
        }
      }

      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedId = 'user-123';
  });

  it('deve renderizar os campos do formulário', async () => {
    const { findByLabelText, findByText } = renderWithNavigation();

    expect(await findByLabelText('Digite a senha atual')).toBeTruthy();
    expect(await findByLabelText('Digite a nova senha')).toBeTruthy();
    expect(await findByLabelText('Confirme a nova senha')).toBeTruthy();
    expect(await findByText('Salvar')).toBeTruthy();
  });

  it('deve submeter e navegar após sucesso', async () => {
    mockPatch.mockResolvedValueOnce({ data: {} });

    const { findByLabelText, findByText } = renderWithNavigation();

    fireEvent.changeText(await findByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(await findByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(await findByLabelText('Confirme a nova senha'), 'novaSenha1');

    fireEvent.press(await findByText('Salvar'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/user/change-password', {
        oldPassword: 'senhaAntiga123',
        newPassword: 'novaSenha1',
      });
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text2: 'Senha atualizada com sucesso!',
        }),
      );
    });
  });

  it('deve mostrar erro ao submeter sem preencher campos', async () => {
    const { findByText, getAllByText } = renderWithNavigation();

    fireEvent.press(await findByText('Salvar'));

    await waitFor(() => {
      const errors = getAllByText('Campo obrigatório');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('deve mostrar erro quando as senhas não coincidem', async () => {
    const { findByText, findByLabelText } = renderWithNavigation();

    fireEvent.changeText(await findByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(await findByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(await findByLabelText('Confirme a nova senha'), 'senhaDiferente');

    fireEvent.press(await findByText('Salvar'));

    expect(await findByText('Senhas não coincidem')).toBeTruthy();
  });

  it('deve mostrar alerta de erro se a API falhar', async () => {
    mockPatch.mockRejectedValueOnce(new Error('Erro na API'));

    const { findByLabelText, findByText } = renderWithNavigation();

    fireEvent.changeText(await findByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(await findByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(await findByLabelText('Confirme a nova senha'), 'novaSenha1');

    fireEvent.press(await findByText('Salvar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Erro ao mudar senha. Tente novamente mais tarde.',
        }),
      );
    });
  });

  it('deve mostrar mensagem específica do backend para senha atual incorreta', async () => {
    mockPatch.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Senha inválida.' },
      },
      isAxiosError: true,
    });

    const { findByLabelText, findByText } = renderWithNavigation();

    fireEvent.changeText(await findByLabelText('Digite a senha atual'), 'senhaErrada');
    fireEvent.changeText(await findByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(await findByLabelText('Confirme a nova senha'), 'novaSenha1');

    fireEvent.press(await findByText('Salvar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Senha inválida.',
        }),
      );
    });
  });

  it('deve mostrar mensagem específica do backend para nova senha igual à antiga', async () => {
    mockPatch.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { message: 'A nova senha não pode ser igual à senha antiga.' },
      },
      isAxiosError: true,
    });

    const { findByLabelText, findByText } = renderWithNavigation();

    fireEvent.changeText(await findByLabelText('Digite a senha atual'), 'mesmaSenha123');
    fireEvent.changeText(await findByLabelText('Digite a nova senha'), 'mesmaSenha123');
    fireEvent.changeText(await findByLabelText('Confirme a nova senha'), 'mesmaSenha123');

    fireEvent.press(await findByText('Salvar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'A nova senha não pode ser igual à senha antiga.',
        }),
      );
    });
  });
});
