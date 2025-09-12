import React from 'react';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Groups from '../pages/Groups/Groups';
import { NavigationContainer } from '@react-navigation/native';

import { View } from 'react-native';

View.prototype.measure = (
  cb: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void,
) => {
  cb(10, 10, 200, 50, 100, 100);
};

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const originalModule = jest.requireActual('@react-navigation/native');
  return {
    ...originalModule,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} />,
  };
});

jest.mock('../services/api');

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../assets/add-icon.svg', () => 'AddIcon');

describe('Groups', () => {
  const mockedApi = api as jest.Mocked<typeof api>;
  const mockedStorage = storage as jest.Mocked<typeof storage>;

  const mockGroupsData = [
    {
      groupId: 'group-1',
      group: { name: 'Grupo 1' },
      participantCount: 15,
    },
    {
      groupId: 'group-2',
      group: { name: 'Grupo 2' },
      participantCount: 22,
    },
  ];

  const mockModerator = { id: 'moderator-user', role: 'MODERATOR' };
  const mockRegularUser = { id: 'regular-user', role: 'USER' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve renderizar o cabecalho e a lista de grupos corretamente', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'regular-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: mockGroupsData });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockRegularUser });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { getByText, findByText } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    expect(getByText('Grupos')).toBeTruthy();

    expect(await findByText('Grupo 1')).toBeTruthy();
    expect(await findByText('Grupo 2')).toBeTruthy();
  });

  it('deve mostrar uma tela vazia se o usuário não tiver grupos', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'regular-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockRegularUser });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    await waitFor(() => expect(getByText('Grupos')).toBeTruthy());

    expect(queryByText('Grupo de Estudos')).toBeNull();
    expect(queryByText('Futebol de Terça')).toBeNull();
  });

  it('deve navegar para "EntrarGrupo" quando um usuário comum clica no botão de adicionar', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'regular-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockRegularUser });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { findByTestId } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    const addButton = await findByTestId('add-button');

    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('EntrarGrupo');
    });
  });

  it('deve mostrar um popup quando um moderador clica no botão de adicionar', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'moderator-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockModerator });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { findByTestId, findByText, queryByText } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    expect(queryByText('Criar Grupo')).toBeNull();

    const addButton = await findByTestId('add-button');
    fireEvent.press(addButton);

    expect(await findByText('Criar Grupo')).toBeTruthy();
    expect(await findByText('Entrar em Grupo')).toBeTruthy();
  });

  it('deve navegar para "CreateGroup" quando um moderador seleciona a opção no popup', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'moderator-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockModerator });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { findByTestId, findByText, queryByText } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    const addButton = await findByTestId('add-button');

    fireEvent.press(addButton);

    const createGroupOption = await findByText('Criar Grupo');
    fireEvent.press(createGroupOption);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('CreateGroup');
    });

    expect(queryByText('Criar Grupo')).toBeNull();
  });

  it('deve navegar para "EntrarGrupo" quando um moderador seleciona a opção no popup', async () => {
    mockedStorage.getString.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'moderator-user';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('participant/groups')) {
        console.log('API MOCK: Retornando lista de grupos');
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/user/')) {
        console.log('API MOCK: Retornando dados do usuário');
        return Promise.resolve({ data: mockModerator });
      }
      console.log(`API MOCK: Chamada não mapeada para ${url}, retornando objeto vazio.`);
      return Promise.resolve({ data: {} });
    });

    const { findByTestId, findByText, queryByText } = render(
      <NavigationContainer>
        <Groups />
      </NavigationContainer>,
    );

    const addButton = await findByTestId('add-button');

    fireEvent.press(addButton);

    const joinGroupOption = await findByText('Entrar em Grupo');
    fireEvent.press(joinGroupOption);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('EntrarGrupo');
    });

    expect(queryByText('Entrar Grupo')).toBeNull();
  });
});
