import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import api from '../services/api';
import ChangePassword from '../pages/ChangePassword/ChangePassword';
import Config from '../pages/Configuration/Configuration';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));
jest.mock('../services/api');
const mockPatch = api.patch as jest.Mock;

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

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return '123';
      return null;
    },
  },
}));

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
  });

  it('deve renderizar os campos do formulário', () => {
    const { getByLabelText, getByText } = renderWithNavigation();

    expect(getByLabelText('Digite a senha atual')).toBeTruthy();
    expect(getByLabelText('Digite a nova senha')).toBeTruthy();
    expect(getByLabelText('Confirme a nova senha')).toBeTruthy();
    expect(getByText('Confirmar')).toBeTruthy();
  });

  it('deve submeter e navegar após sucesso', async () => {
    mockPatch.mockResolvedValueOnce({ data: {} });

    const { getByLabelText, getByText } = renderWithNavigation();

    fireEvent.changeText(getByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha1');

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        expect.stringContaining('/change-password'),
        expect.objectContaining({
          oldPassword: 'senhaAntiga123',
          newPassword: 'novaSenha1',
        }),
        expect.any(Object),
      );

      expect(global.alert).toHaveBeenCalledWith('Senha atualizada com sucesso!');
    });
  });

  it('deve mostrar erro ao submeter sem preencher campos', async () => {
    const { getByText, getAllByText } = renderWithNavigation();

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      const errors = getAllByText('Campo obrigatório');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('deve mostrar erro quando as senhas não coincidem', async () => {
    const { getByText, getByLabelText } = renderWithNavigation();

    fireEvent.changeText(getByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'senhaDiferente');

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(getByText('Senhas não coincidem')).toBeTruthy();
    });
  });

  it('deve mostrar alerta de erro se a API falhar', async () => {
    mockPatch.mockRejectedValueOnce(new Error('Erro na API'));

    const { getByLabelText, getByText } = renderWithNavigation();

    fireEvent.changeText(getByLabelText('Digite a senha atual'), 'senhaAntiga123');
    fireEvent.changeText(getByLabelText('Digite a nova senha'), 'novaSenha1');
    fireEvent.changeText(getByLabelText('Confirme a nova senha'), 'novaSenha1');

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao mudar senha. Tente novamente mais tarde.');
    });
  });
});
