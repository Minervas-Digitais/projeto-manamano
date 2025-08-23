import { fireEvent, render, waitFor } from '@testing-library/react-native';
import api from '../services/api';
import GroupPage from '../pages/GroupPage/GroupPage';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../assets/notification-icon.svg', () => 'NotificationIcon');
jest.mock('../assets/add-post-icon.svg', () => 'AddPostIcon');

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useRoute: () => ({
      params: {
        groupId: 'test-group-id-123',
        groupName: 'Grupo de Teste',
      },
    }),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn((key: string) => {
      if (key === 'accessToken') return 'mock-test-token';
      if (key === 'loggedId') return 'mock-user-id-abc';
      return null;
    }),
    set: jest.fn(),
  },
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(),
}));

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

interface Post {
  id: string;
  nameUser: string;
  input: string;
  numComments: number;
  createdAt: string;
  isPinned: boolean;
  type: 'NORMAL' | 'EVENT' | 'CLASS';
  categoryName: string;
  title?: string;
  schedule?: string;
  urlLive?: string;
}

interface Category {
  name: string;
}

describe('GroupPage', () => {
  const mockPosts: Post[] = [
    {
      id: 'post-1',
      nameUser: 'John Doe',
      input: 'Fixed post',
      numComments: 5,
      createdAt: new Date().toISOString(),
      isPinned: true,
      type: 'NORMAL',
      categoryName: 'Geral',
    },
    {
      id: 'post-2',
      nameUser: 'Teste 1',
      input: 'Outro post para o mural.',
      numComments: 2,
      createdAt: new Date().toISOString(),
      isPinned: false,
      type: 'NORMAL',
      categoryName: 'Geral',
    },
    {
      id: 'event-1',
      title: 'Reuniao 1',
      input: 'Descrição do evento aqui',
      createdAt: new Date().toISOString(),
      isPinned: false,
      type: 'EVENT',
      categoryName: 'Eventos',
      nameUser: 'Admin',
      numComments: 0,
    },
    {
      id: 'class-1',
      title: 'Aula 1',
      schedule: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      urlLive: 'http://zoom.us/live',
      type: 'CLASS',
      categoryName: 'Aulas',
      nameUser: 'Professor',
      input: '',
      numComments: 0,
      isPinned: false,
    },
  ];

  const mockCategories: Category[] = [{ name: 'Geral' }, { name: 'Eventos' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os posts e categorias corretamente ao carregar', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/post/group')) {
        return Promise.resolve({ data: mockPosts });
      }
      if (url.includes('/category/group')) {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.resolve({ data: [] });
    });

    const { getByText, findByText } = render(
      <NavigationContainer>
        <GroupPage navigation={{ navigate: jest.fn() }} />
      </NavigationContainer>,
    );

    expect(getByText('Grupo de Teste')).toBeTruthy();
    expect(await findByText('Fixed post')).toBeTruthy();
    expect(await findByText('Outro post para o mural.')).toBeTruthy();
    expect(getByText('Geral')).toBeTruthy();
    expect(getByText('Eventos')).toBeTruthy();
  });

  it('deve alternar para a aba "Aulas" e exibir as aulas', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/post/group')) {
        return Promise.resolve({ data: mockPosts });
      }
      if (url.includes('/category/group')) {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.resolve({ data: [] });
    });

    const { getByText, queryByText, findByText } = render(
      <NavigationContainer>
        <GroupPage navigation={{ navigate: jest.fn() }} />
      </NavigationContainer>,
    );

    await findByText('Fixed post');

    fireEvent.press(getByText('Aulas'));

    await waitFor(() => {
      expect(getByText('Aula 1')).toBeTruthy();
      expect(queryByText('Fixed post')).toBeNull();
    });
  });

  it('deve navegar para a tela NewPost ao pressionar o botão de adicionar post', async () => {
    const navigateMock = jest.fn();

    mockedApi.get.mockResolvedValue({ data: [] });

    const { getByTestId, findByText } = render(
      <NavigationContainer>
        <GroupPage navigation={{ navigate: navigateMock }} />
      </NavigationContainer>,
    );

    await findByText('Categorias');

    fireEvent.press(getByTestId('add-post-button'));

    expect(navigateMock).toHaveBeenCalledWith('NewPost', { groupId: 'test-group-id-123' });
  });

  it('deve chamar a API para fixar um post quando o botão de fixar é pressionado', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/post/group')) {
        return Promise.resolve({ data: mockPosts });
      }
      if (url.includes('/category/group')) {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.resolve({ data: [] });
    });

    mockedApi.patch.mockResolvedValue({ data: {} });
    mockedApi.post.mockResolvedValue({ data: {} });

    const { findByTestId } = render(
      <NavigationContainer>
        <GroupPage navigation={{ navigate: jest.fn() }} />
      </NavigationContainer>,
    );

    const unpinnedPost = mockPosts.find((p) => !p.isPinned)!;
    const dotsMenuButton = await findByTestId(`dots-menu-${unpinnedPost.id}`);
    fireEvent.press(dotsMenuButton);

    const modalFixButton = await findByTestId('modal-fix-button');
    fireEvent.press(modalFixButton);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/post/${unpinnedPost.id}`,
        { isPinned: true },
        expect.any(Object),
      );
    });
  });
});
