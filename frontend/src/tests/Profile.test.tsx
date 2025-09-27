import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Profile from '../pages/Profile/Profile';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');
jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
  },
}));
jest.mock('../assets/duck.png', () => 'duckImage');
jest.mock('../components/SideMenu/SideMenu', () => 'SideMenu');
jest.mock('../assets/location-icon.svg', () => 'Location');
jest.mock('../assets/share-white-icon.svg', () => 'ShareWhite');
jest.mock('../assets/menuWhite-icon.svg', () => 'MenuIcon');
jest.mock('../assets/pen-icon.svg', () => 'Pen');
jest.mock('../assets/business-icon.svg', () => 'Business');

// Componente PostCard
jest.mock('../components/PostCard/PostCard', () => ({ nameUser, postContent }: any) => {
  const { Text } = require('react-native');
  return (
    <>
      <Text>{nameUser}</Text>
      <Text>{postContent}</Text>
    </>
  );
});

describe('Profile', () => {
  const mockedApi = api as jest.Mocked<typeof api>;
  const mockedStorage = storage as jest.Mocked<typeof storage>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getString.mockImplementation((key: string): string | undefined => {
      if (key === 'accessToken') return 'mock-token';
      if (key === 'loggedId') return 'mock-user-id';
      return undefined;
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

      return Promise.reject(new Error('Not found'));
    });
  });

  it('deve alternar para aba de postagens salvas', async () => {
    const { getByText, queryByText } = render(<Profile navigation={{ navigate: jest.fn() }} />);

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

      return Promise.reject(new Error('Not found'));
    });

    const { getByText } = render(<Profile navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(getByText('Nenhuma Publicação encontrada')).toBeTruthy();
    });

    fireEvent.press(getByText('Salvas'));

    await waitFor(() => {
      expect(getByText('Nenhuma Publicação salva')).toBeTruthy();
    });
  });
});
