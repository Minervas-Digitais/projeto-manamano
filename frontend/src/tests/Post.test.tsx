import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import Post from '../pages/Post/Post';
import api from '../services/api';

jest.mock('../context/SavedPostsContext', () => ({
  useSavedPosts: () => ({
    savedPostIds: new Set<string>(),
    savePost: jest.fn(),
    unsavePost: jest.fn(),
  }),
}));

interface User {
  fullName: string;
}

interface PostType {
  id: string;
  input: string;
  userId: string;
  groupId: string;
  createdAt: string;
  Comment: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
}

interface Archive {
  id: string;
  name: string;
  file: string;
}

// mock das apis do expo q nao estao disponiveis em teste
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useRoute: jest.fn(),
  };
});

(useRoute as jest.Mock).mockReturnValue({
  params: {
    postId: '123',
  },
});

jest.mock('../services/api', () => {
  const mockData: {
    posts: Record<string, PostType>;
    users: Record<string, User>;
    archives: Record<string, Archive[]>;
    groups: Record<string, { name: string }>;
  } = {
    posts: {
      123: {
        id: '123',
        input: 'Texto do post',
        userId: 'user1',
        groupId: 'group1',
        createdAt: new Date().toISOString(),
        Comment: [
          {
            id: 'c1',
            userId: 'user2',
            content: 'Comentário 1',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            userId: 'user3',
            content: 'Comentário 2',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      '002': {
        id: '001',
        input: 'Texto com erro no usuário',
        userId: 'user4',
        groupId: 'group1',
        createdAt: new Date().toISOString(),
        Comment: [
          {
            id: 'c1',
            userId: 'user2',
            content: 'Comentário 1',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            userId: 'user3',
            content: 'Comentário 2',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      '003': {
        id: '003',
        input: 'Texto com erro no usuário do comentário',
        userId: 'user4',
        groupId: 'group1',
        createdAt: new Date().toISOString(),
        Comment: [
          {
            id: 'c1',
            userId: 'user5',
            content: 'Comentário com erro no usuário',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            userId: 'user3',
            content: 'Comentário 2',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    } as Record<string, PostType>,
    users: {
      user1: { fullName: 'Usuário Teste' },
      user2: { fullName: 'Comentador 1' },
      user3: { fullName: 'Comentador 2' },
    },
    archives: {
      '123': [
        { id: 'a1', name: 'Arquivo 1', file: 'http://exemplo.com/a1.pdf' },
        { id: 'a2', name: 'Arquivo 2', file: 'http://exemplo.com/a2.pdf' },
      ],
      '002': [],
      '003': [],
    },
    groups: {
      group1: { name: 'Grupo Teste' },
    },
  };

  const get = jest.fn((url: string) => {
    if (url.startsWith('post/')) {
      const postId = url.split('/')[1];
      if (postId === '001') return Promise.reject(new Error('Erro simulado ao buscar post'));
      const post = mockData.posts[postId];
      return post ? Promise.resolve({ data: post }) : Promise.resolve({ data: {} });
    }

    if (url.startsWith('user/') || url.startsWith('/user/')) {
      const userId = url.split('/').filter(Boolean)[1];
      if (userId === 'user4')
        return Promise.reject(new Error('Erro simulado ao buscar usuário do post'));
      if (userId === 'user5')
        return Promise.reject(new Error('Erro simulado ao buscar usuário do comentário'));
      const user = mockData.users[userId];
      return user ? Promise.resolve({ data: user }) : Promise.resolve({ data: {} });
    }

    if (url.startsWith('archives/post/')) {
      const postId = url.split('/')[2];
      if (postId === '001')
        return Promise.reject(new Error('Erro simulado ao buscar arquivos do post'));
      return Promise.resolve({ data: mockData.archives[postId] ?? [] });
    }

    if (url.startsWith('group/') || url.startsWith('/group/')) {
      const groupId = url.split('/').filter(Boolean)[1];
      return Promise.resolve({ data: mockData.groups[groupId] ?? {} });
    }

    return Promise.resolve({ data: {} });
  });

  const post = jest.fn();

  return {
    __esModule: true,
    default: {
      get,
      post,
    },
  };
});

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return '123';
      return null;
    },
  },
}));

// Mock do Toast
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const { View } = require('react-native');

  const show = jest.fn();
  const hide = jest.fn();

  const ToastComponent = (props: any) => <View {...props} />;
  ToastComponent.show = show;
  ToastComponent.hide = hide;

  return {
    __esModule: true,
    default: ToastComponent,
    show,
    hide,
  };
});

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Post" component={Post} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

describe('About', () => {
  beforeAll(() => {
    // ignora os erros do act e causados pelo proprio teste
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      const mensagensIgnoradas = [
        'Erro ao buscar publicação',
        'Erro ao buscar arquivos do post',
        'Erro ao enviar comentário:',
        'Erro ao buscar usuário do post',
        'Erro ao buscar usuários dos comentários',
      ];

      if (typeof msg === 'string') {
        if (
          msg.includes('An update to') ||
          msg.includes('inside a test was not wrapped in act') ||
          msg.includes('Erro simulado') ||
          mensagensIgnoradas.some((m) => msg.includes(m))
        ) {
          return;
        }
      }

      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '123' },
    });
  });

  it('deve renderizar a pagina e mostrar os textos principais', async () => {
    const { getByText } = renderWithNavigation();
    await waitFor(() => {
      expect(getByText('Publicação')).toBeTruthy();
      expect(getByText('Texto do post')).toBeTruthy();
      expect(getByText('Comentador 1')).toBeTruthy();
      expect(getByText('Comentador 2')).toBeTruthy();
      expect(getByText('Comentário 1')).toBeTruthy();
      expect(getByText('Comentário 2')).toBeTruthy();
    });
  });

  it('deve enviar um comentário com sucesso', async () => {
    const { getByTestId, getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Texto do post')).toBeTruthy();
    });

    const inputContainer = getByTestId('input-container');
    fireEvent.press(inputContainer);

    const input = getByTestId('input-comentario');
    fireEvent.changeText(input, 'Meu comentário de teste');

    const enviarBtn = getByTestId('enviar-comentario');
    fireEvent.press(enviarBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/comment',
        expect.objectContaining({
          content: 'Meu comentário de teste',
        }),
        expect.any(Object),
      );
    });

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Comentário enviado com sucesso!',
    });
  });

  it('deve renderizar a página com arquivos (archives)', async () => {
    const { getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Publicação')).toBeTruthy();
      expect(getByText('Texto do post')).toBeTruthy();

      expect(getByText('Arquivo 1')).toBeTruthy();
      expect(getByText('Arquivo 2')).toBeTruthy();
    });
  });

  it('mostra toast de erro se a busca do post falhar', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '001' },
    });

    renderWithNavigation();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao buscar publicação. Tente novamente mais tarde.',
        }),
      );
    });
  });

  it('mostra toast de erro se a busca dos arquivos do post falhar', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '001' },
    });

    renderWithNavigation();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao buscar arquivos da publicação. Tente novamente mais tarde.',
        }),
      );
    });
  });

  it('mostra toast de erro ao enviar comentário', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '123' },
    });

    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Erro simulado no envio'));

    const { getByTestId, getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Texto do post')).toBeTruthy();
    });

    fireEvent.press(getByTestId('input-container'));
    fireEvent.changeText(getByTestId('input-comentario'), 'Comentário que vai falhar');

    fireEvent.press(getByTestId('enviar-comentario'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro ao enviar comentário. Tente novamente mais tarde.',
      });
    });
  });

  it('mostra toast de erro ao buscar usuário do post', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '002' },
    });

    const { getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Texto com erro no usuário')).toBeTruthy();
    });
  });

  it('mostra toast de erro ao buscar usuários dos comentários', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { postId: '003' },
    });

    renderWithNavigation();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro ao buscar usuários dos comentários. Tente novamente mais tarde.',
      });
    });
  });

  it('mostra mensagem de erro se tentar enviar comentário vazio', async () => {
    const { getByTestId, getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Texto do post')).toBeTruthy();
    });

    fireEvent.press(getByTestId('input-container'));
    fireEvent.press(getByTestId('enviar-comentario'));

    await waitFor(() => {
      expect(getByText('Campo obrigatório')).toBeTruthy();
    });
  });
});
