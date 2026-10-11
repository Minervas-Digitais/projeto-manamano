/* eslint-disable no-console */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import EnterGroup from '../pages/EnterGroup/EnterGroup';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');
const mockPost = api.post as jest.Mock;

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

const Stack = createStackNavigator();
const GroupsScreen = () => <Text>Groups Screen</Text>;

const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EnterGroup" component={EnterGroup} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
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
  mockLoggedId = 'user-123';
});

describe('EnterGroup', () => {
  it('deve renderizar input e botão', () => {
    const { getByLabelText, getByText } = renderWithNavigation();

    expect(getByLabelText('Código de Convite')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('deve submeter e navegar após sucesso', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    const { getByLabelText, getByText, findByText } = renderWithNavigation();

    fireEvent.changeText(getByLabelText('Código de Convite'), 'ABC123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/participant', {
        inviteCode: 'ABC123',
      });
    });

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Você entrou no grupo com sucesso!',
    });

    expect(await findByText('Groups Screen')).toBeTruthy();
  });

  it('deve mostrar erro ao submeter sem preencher o código', async () => {
    const { getByText, queryByText } = renderWithNavigation();

    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      expect(queryByText('Campo obrigatório')).toBeTruthy();
    });
  });
});
