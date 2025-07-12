/* eslint-disable no-console */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import api from '../services/api';
import EnterGroup from '../pages/EnterGroup/EnterGroup';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');
const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return '123';
      return null;
    },
  },
}));

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EnterGroup" component={EnterGroup} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
    console.warn(msg);
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EnterGroup', () => {
  it('deve renderizar input e botão', () => {
    const { getByLabelText, getByText } = renderWithNavigation();

    expect(getByLabelText('Código de Convite')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('deve submeter e navegar após sucesso', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: '1', inviteCode: 'ABC123' }],
    });
    mockPost.mockResolvedValueOnce({ data: {} });

    const { getByLabelText, getByText } = renderWithNavigation();

    fireEvent.changeText(getByLabelText('Código de Convite'), 'ABC123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        '/group',
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        }),
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/participant',
        expect.objectContaining({
          userId: '123',
          role: 'MEMBER',
          inviteCode: 'ABC123',
          groupId: '1',
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        }),
      );
    });
  });

  it('deve mostrar erro ao submeter sem preencher o código', async () => {
    const { getByText, queryByText } = renderWithNavigation();

    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockGet).not.toHaveBeenCalled();
      expect(queryByText('Campo obrigatório')).toBeTruthy();
    });
  });
});
