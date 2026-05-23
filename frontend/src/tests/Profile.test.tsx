import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Profile from '../pages/Profile/Profile';
import api from '../services/api';
import storage from '../services/secureStorage';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');
jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));
jest.mock('../assets/duck.png', () => 'duckImage');
jest.mock('../components/SideMenu/SideMenu', () => 'SideMenu');
jest.mock('../assets/location-icon.svg', () => 'Location');
jest.mock('../assets/share-white-icon.svg', () => 'ShareWhite');
jest.mock('../assets/menu-white-icon.svg', () => 'MenuIcon');
jest.mock('../assets/pen-icon.svg', () => 'Pen');
jest.mock('../assets/business-icon.svg', () => 'Business');

// Componente PostCard mockado
jest.mock('../components/PostCard/PostCard', () => {
  return ({ nameUser, postContent }: any) => {
    const { Text } = require('react-native');
    return (
      <>
        <Text>{nameUser}</Text>
        <Text>{postContent}</Text>
      </>
    );
  };
});

describe('Profile', () => {
  const mockedApi = api as jest.Mocked<typeof api>;
  const mockedStorage = storage as any;

  function renderWithNavigation(ui: React.ReactElement) {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'mock-token';
      if (key === 'loggedId') return 'mock-user-id';
      return null;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/user/mock-user-id') {
        return Promise.resolve({
          data: {
            fullName: 'Maria Silva',
            neighborhood: 'random',
            enterprise: 'Padaria da Maria',
            bio: 'Empreendedora local',
            savedPost: [101],
          },
        });
      }

      if (url === '/post/mock-user-id/posts') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              nameUser: 'Maria Silva',
              input: 'Postagem da Maria',
              numComments: 2,
              createdAt: '2025-01-01',
            },
          ],
        });
      }

      if (url === '/post/101') {
        return Promise.resolve({
          data: {
            id: 101,
            nameUser: 'João',
            input: 'Post salvo pelo João',
            numComments: 1,
            createdAt: '2025-01-02',
          },
        });
      }

      if (url === '/post/saved') {
        return Promise.resolve({
          data: [
            {
              id: 101,
              nameUser: 'João',
              input: 'Post salvo pelo João',
              numComments: 1,
              createdAt: '2025-01-02',
            },
          ],
        });
      }

      return Promise.reject(new Error('Not found'));
    });
  });

  it('deve alternar para aba de postagens salvas', async () => {
    const { getByText, queryByText } = renderWithNavigation(<Profile />);

    await waitFor(() => getByText('Publicações'));

    fireEvent.press(getByText('Salvas'));

    await waitFor(() => {
      expect(queryByText('Post salvo pelo João')).toBeTruthy();
    });
  });

  it('deve mostrar mensagem caso não existam postagens', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/user/mock-user-id') {
        return Promise.resolve({
          data: {
            fullName: 'Maria Sem Post',
            neighborhood: 'random',
            enterprise: 'Nenhuma Empresa',
            bio: 'Sem publicações',
            savedPost: [],
          },
        });
      }

      if (url === '/post/mock-user-id/posts') {
        return Promise.resolve({ data: [] });
      }

      if (url === '/post/saved') {
        return Promise.resolve({ data: [] });
      }

      return Promise.reject(new Error('Not found'));
    });

    const { getByText } = renderWithNavigation(<Profile />);

    await waitFor(() => {
      expect(getByText('Nenhuma Publicação encontrada')).toBeTruthy();
    });

    fireEvent.press(getByText('Salvas'));

    await waitFor(() => {
      expect(getByText('Nenhuma Publicação salva')).toBeTruthy();
    });
  });
});
