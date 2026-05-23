import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import Home from '../pages/Home/Home';
import api from '../services/api';
import storage from '../services/secureStorage';

// Mocks
const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    callback();
  },
}));

jest.mock('../services/api');
jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => <View>{children}</View>,
}));

// Mock do SideMenu para evitar complexidade no teste da Home
jest.mock('../components/SideMenu/SideMenu', () => {
  const MockSideMenu = () => null;
  return MockSideMenu;
});

jest.mock('../components/PostCard/PostCard', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  return function MockPostCard({ postContent, onPressPost, postId }: any) {
    return (
      <TouchableOpacity onPress={onPressPost} testID={`post-card-${postId || 'unknown'}`}>
        <Text>{postContent}</Text>
      </TouchableOpacity>
    );
  };
});

describe('Home Page', () => {
  const apiGetMock = api.get as jest.Mock;
  const storageGetMock = storage.getItem as jest.Mock;

  const mockUser = { fullName: 'Usuário Teste' };
  const mockGroups = [
    {
      groupId: 'group-1',
      participantCount: 5,
      group: {
        name: 'Grupo de Teste 1',
      },
    },
    {
      groupId: 'group-2',
      participantCount: 10,
      group: {
        name: 'Grupo de Teste 2',
      },
    },
  ];

  const mockPosts = [
    {
      id: 'post-1',
      input: 'Conteúdo do primeiro post.',
      commentsCount: 2,
      createdAt: new Date().toISOString(),
      groupId: 'group-1',
      group: {
        name: 'Grupo de Teste 1',
      },
      user: {
        id: 'author-1',
        fullName: 'Autor 1',
      },
    },
  ];

  const mockPostsResponse = {
    data: {
      posts: mockPosts,
      pagination: {
        hasMore: false,
      },
    },
  };

  const emptyPostsResponse = {
    data: {
      posts: [],
      pagination: {
        hasMore: false,
      },
    },
  };

  const groupWithoutPosts = [
    {
      groupId: 'group-1',
      participantCount: 5,
      group: {
        name: 'Grupo Sem Posts',
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
      if (url.includes('/user/') && url.includes('/profile-picture')) {
        return Promise.reject(new Error('No profile picture'));
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('participant/groups/posts')) {
        return Promise.resolve(mockPostsResponse);
      }
      if (url.includes('participant/groups/')) {
        return Promise.resolve({ data: mockGroups });
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
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes('/user/') && url.includes('/profile-picture')) {
        return Promise.reject(new Error('No profile picture'));
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('participant/groups/posts')) {
        return Promise.resolve(emptyPostsResponse);
      }
      if (url.includes('participant/groups/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });

    const { findByText } = render(<Home navigation={{ navigate: mockedNavigate }} />);

    expect(await findByText('Você não possui grupos...')).toBeTruthy();
  });

  it('should display a message if there are no posts', async () => {
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes('/user/') && url.includes('/profile-picture')) {
        return Promise.reject(new Error('No profile picture'));
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('participant/groups/posts')) {
        return Promise.resolve(emptyPostsResponse);
      }
      if (url.includes('participant/groups/')) {
        return Promise.resolve({ data: groupWithoutPosts });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });

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
