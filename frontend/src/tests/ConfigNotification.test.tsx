import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigNotification from '../pages/ConfigNotification/ConfigNotification';
import api from '../services/api';

jest.mock('../services/api', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        disablePopup: false,
        muteSystem: false,
        muteGroups: false,
      },
    }),
  ),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      return null;
    }),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ConfigNotification" component={ConfigNotification} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

describe('ConfigNotification', () => {
  const testButtons = [
    {
      idSuffix: 'Desabilitar-notificação-pop-up',
      label: 'Desabilitar notificação pop-up',
    },
    {
      idSuffix: 'Silenciar-notificação-do-Sistema',
      label: 'Silenciar notificação do Sistema',
    },
    {
      idSuffix: 'Silenciar-notificação-dos-grupos',
      label: 'Silenciar notificação dos grupos',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        disablePopup: false,
        muteSystem: false,
        muteGroups: false,
      },
    });
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });
  });

  it('deve renderizar a pagina e mostrar os textos principais', async () => {
    const { findByText } = renderWithNavigation();

    expect(await findByText('Notificações')).toBeTruthy();
    expect(await findByText('Desabilitar notificação pop-up')).toBeTruthy();
    expect(await findByText('Silenciar notificação do Sistema')).toBeTruthy();
    expect(await findByText('Silenciar notificação dos grupos')).toBeTruthy();
  });

  test.each(testButtons)(
    'deve alternar os ícones SVG ao clicar no botão %s',
    async ({ idSuffix, label }) => {
      const { findByTestId, findByText, queryByTestId } = renderWithNavigation();

      await findByTestId(`toggle-${idSuffix}`);

      expect(await findByTestId(`EllipseB-${idSuffix}`)).toBeTruthy();
      expect(await findByTestId(`Rect-${idSuffix}`)).toBeTruthy();
      expect(queryByTestId(`EllipseW-${idSuffix}`)).toBeNull();
      expect(queryByTestId(`RectActv-${idSuffix}`)).toBeNull();

      fireEvent.press(await findByText(label));

      await waitFor(() => {
        expect(queryByTestId(`EllipseW-${idSuffix}`)).toBeTruthy();
        expect(queryByTestId(`RectActv-${idSuffix}`)).toBeTruthy();
        expect(queryByTestId(`EllipseB-${idSuffix}`)).toBeNull();
        expect(queryByTestId(`Rect-${idSuffix}`)).toBeNull();
      });
    },
  );
});
