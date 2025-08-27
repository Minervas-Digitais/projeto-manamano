import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../pages/Home/Home';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';

// Mocks
const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

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

// Mock do SideMenu para evitar complexidade no teste da Home
jest.mock('../components/SideMenu/SideMenu', () => {
  const MockSideMenu = () => null;
  return MockSideMenu;
});

describe('Home Page', () => {
  const apiGetMock = api.get as jest.Mock;
  const storageGetMock = storage.getString as jest.Mock;

  const mockUser = { fullName: 'Usuário Teste' };
  const mockGroupsWithPosts = [
    {
      groupId: 'group-1',
      participantCount: 5,
      group: {
        name: 'Grupo de Teste 1',
        Post: [
          {
            id: 'post-1',
            input: 'Conteúdo do primeiro post.',
            commentsCount: 2,
            createdAt: new Date().toISOString(),
            user: { fullName: 'Autor 1' },
          },
        ],
      },
    },
    {
      groupId: 'group-2',
      participantCount: 10,
      group: {
        name: 'Grupo de Teste 2',
        Post: [], // Grupo sem posts para testar a renderização mista
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuração padrão para um usuário logado com dados
    storageGetMock.mockImplementation((key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-123';
      return null;
    });
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('participant/groups/')) {
        return Promise.resolve({ data: mockGroupsWithPosts });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });
  });

  it('should render user name, groups, and posts correctly', async () => {
    const { findByText, findAllByText } = render(
      <Home navigation={{ navigate: mockedNavigate }} />,
    );

    // Verifica se o nome do usuário é renderizado
    expect(await findByText('Olá,')).toBeTruthy();
    expect(await findByText('Usuário Teste!')).toBeTruthy();

    // Verifica se os títulos das seções estão presentes
    expect(await findByText('Grupos')).toBeTruthy();
    expect(await findByText('Mural')).toBeTruthy();

    const groupElements = await findAllByText('Grupo de Teste 1');
    expect(groupElements.length).toBeGreaterThan(0);
    expect(await findByText('Conteúdo do primeiro post.')).toBeTruthy();
  });

  it('should display a message if there are no groups', async () => {
    apiGetMock.mockResolvedValueOnce({ data: mockUser }).mockResolvedValueOnce({ data: [] });

    const { findByText } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    expect(await findByText('Você não possui grupos...')).toBeTruthy();
  });

  it('should display a message if there are no posts', async () => {
    const groupsWithoutPosts = [
      {
        groupId: 'group-1',
        participantCount: 5,
        group: { name: 'Grupo Sem Posts', Post: [] },
      },
    ];
    apiGetMock
      .mockResolvedValueOnce({ data: mockUser })
      .mockResolvedValueOnce({ data: groupsWithoutPosts });

    const { findByText } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    expect(await findByText('Grupo Sem Posts')).toBeTruthy();
    expect(await findByText('Não há Posts...')).toBeTruthy();
  });

  it('should navigate to GroupPage when a group button is pressed', async () => {
    const { findByTestId } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    // Usa o testID para encontrar o botão de forma única
    const groupButton = await findByTestId('group-button-group-1');
    fireEvent.press(groupButton);

    expect(mockedNavigate).toHaveBeenCalledWith('GroupPage', {
      groupId: 'group-1',
      groupName: 'Grupo de Teste 1',
    });
  });

  it('should navigate to Post page when a post card is pressed', async () => {
    const { findByText } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    const postCard = await findByText('Conteúdo do primeiro post.');
    fireEvent.press(postCard);

    expect(mockedNavigate).toHaveBeenCalledWith('Post', {
      postId: 'post-1',
    });
  });

  it('should navigate to Profile page when profile image is pressed', async () => {
    const { findByTestId } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    const profileButton = await findByTestId('profile-button');
    fireEvent.press(profileButton);

    expect(mockedNavigate).toHaveBeenCalledWith('Profile');
  });

  it('should navigate to Search page when search icon is pressed', async () => {
    const { findByTestId } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    const searchButton = await findByTestId('search-button');
    fireEvent.press(searchButton);

    expect(mockedNavigate).toHaveBeenCalledWith('Search');
  });

  it('should filter posts when a group filter is toggled', async () => {
    const { findByText, queryByText, findByTestId } = render(
      <Home navigation={{ navigate: mockedNavigate }} />,
    );

    await findByText('Conteúdo do primeiro post.');

    const filterButton = await findByTestId('filter-button-group-1');
    fireEvent.press(filterButton);

    await waitFor(() => {
      expect(queryByText('Conteúdo do primeiro post.')).toBeNull();
    });

    fireEvent.press(filterButton);

    expect(await findByText('Conteúdo do primeiro post.')).toBeTruthy();
  });
});
