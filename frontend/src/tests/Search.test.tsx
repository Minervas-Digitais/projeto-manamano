import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';
import Search from '../pages/Search/Search';
import api from '../services/api';

import Profile from '../pages/Profile/Profile';

jest.mock('../context/SavedPostsContext', () => ({
  useSavedPosts: () => ({
    savedPostIds: new Set<string>(),
    savePost: jest.fn(),
    unsavePost: jest.fn(),
  }),
}));

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return '1';
      return null;
    }),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({
    accessToken: 'fake-token',
    loggedId: '1',
  }),
}));

jest.mock('../context/SideMenuContext', () => ({
  SideMenuProvider: ({ children }: any) => children,
  useSideMenu: () => ({
    isOpen: false,
    openMenu: jest.fn(),
    closeMenu: jest.fn(),
    toggleMenu: jest.fn(),
  }),
}));

const setMock = jest.fn();

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => {
        if (key === 'accessToken') return 'fake-token';
        if (key === 'loggedId') return '1';
        if (key === 'recentUsers')
          return JSON.stringify([
            { id: 1, name: 'João Silva', avatar: 'any' },
            { id: 2, name: 'Maria Oliveira', avatar: 'any' },
          ]);
        return null;
      },
      set: jest.fn((...args) => setMock(...args)),
    })),
  };
});

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn((url) => {
      if (url === '/search') {
        return Promise.resolve({
          data: {
            users: [
              { id: '1', fullName: 'João Silva' },
              { id: '5', fullName: 'Maria Souza' },
              { id: '6', fullName: 'Pedro Lima' },
            ],
            groups: [
              { id: '2', name: 'Grupo React' },
              { id: '7', name: 'Grupo Node' },
              { id: '8', name: 'Grupo Design' },
            ],
            posts: [
              {
                id: '3',
                userId: '1',
                groupId: '2',
                nameUser: 'João',
                input: 'Oi',
                numComments: 0,
                createdAt: new Date().toISOString(),
                originGroup: 'Grupo React',
              },
              {
                id: '9',
                userId: '5',
                groupId: '7',
                nameUser: 'Maria',
                input: 'Olá',
                numComments: 1,
                createdAt: new Date().toISOString(),
                originGroup: 'Grupo Node',
              },
              {
                id: '10',
                userId: '6',
                groupId: '8',
                nameUser: 'Pedro',
                input: 'Oi tudo bem?',
                numComments: 2,
                createdAt: new Date().toISOString(),
                originGroup: 'Grupo Design',
              },
            ],
          },
        });
      }
      const pageMatch = url.match(/page=(\d+)/);
      const requestedPage = pageMatch ? Number(pageMatch[1]) : 1;
      if (url.startsWith('/search/filter/users')) {
        if (requestedPage === 2) {
          return Promise.resolve({
            data: {
              data: [{ id: '4', fullName: 'Maria Silva' }],
              meta: { page: 2, limit: 10, total: 15, lastPage: 2 },
            },
          });
        }
        return Promise.resolve({
          data: {
            data: [{ id: '1', fullName: 'João Silva' }],
            meta: { page: 1, limit: 10, total: 15, lastPage: 2 },
          },
        });
      }
      if (url.startsWith('/search/filter/groups')) {
        return Promise.resolve({
          data: {
            data: [{ id: '2', name: 'Grupo React' }],
            meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
          },
        });
      }
      if (url.startsWith('/search/filter/posts')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: '3',
                userId: '1',
                groupId: '2',
                nameUser: 'João',
                input: 'Oi',
                numComments: 0,
                createdAt: new Date().toISOString(),
                originGroup: 'Grupo React',
              },
            ],
            meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
          },
        });
      }

      return Promise.resolve({ data: { users: [], groups: [], posts: [] } });
    }),
    get: jest.fn((url) => {
      if (url.startsWith('/user/')) {
        return Promise.resolve({ data: { fullName: 'João Silva' } });
      }
      if (url.startsWith('/post/')) {
        return Promise.resolve({ data: { Comment: [] } });
      }
      return Promise.resolve({ data: {} });
    }),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

const mockedApi = jest.mocked(api);

jest.mock('../pages/Profile/Profile', () => {
  return () => null;
});

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  const confirmButton = buttons?.find((btn) => btn.text === 'Sim');
  if (confirmButton && confirmButton.onPress) {
    confirmButton.onPress();
  }
});

describe('Search', () => {
  beforeAll(() => {
    // ignora os erros do act e causados pelo proprio teste
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('An update to') || msg.includes('inside a test was not wrapped in act')) {
          return;
        }
      }

      console.warn(msg);
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Usuario Comum', () => {
    it('renderiza título, input e usuários recentes corretamente', async () => {
      const { getByTestId, queryByTestId } = renderWithNavigation();

      // Título
      expect(getByTestId('titulo-pesquisa')).toBeTruthy();

      // Input
      expect(getByTestId('input-pesquisa')).toBeTruthy();

      // Espera usuários recentes carregarem
      await waitFor(() => {
        expect(getByTestId('scroll-recentes')).toBeTruthy();

        // Verifica nomes dos usuários por testID específicos
        expect(getByTestId('usuario-joão-silva')).toBeTruthy();
        expect(getByTestId('usuario-maria-oliveira')).toBeTruthy();
      });

      // Garante que a seção 'Recentes' não está vazia
      expect(queryByTestId('scroll-recentes')).not.toBeNull();
    });

    it('exibe filtros e seções Pessoas, Grupos e Publicações após digitar', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      // Digita no input de busca
      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(
        async () => {
          expect(getByText('Filtros')).toBeTruthy();
        },
        { timeout: 3000 },
      );

      expect(await findByTestId('user-card-1')).toBeTruthy();
      expect(await findByTestId('user-name-1')).toHaveTextContent(/João Silva/i);

      expect(await findByTestId('group-card-2')).toBeTruthy();
      expect(await findByTestId('group-name-2')).toHaveTextContent(/Grupo React/i);

      expect(await findByTestId('post-item-3')).toBeTruthy();

      expect(await findByTestId('ver-todos-pessoas')).toBeTruthy();
      expect(await findByTestId('ver-todos-grupos')).toBeTruthy();
      expect(await findByTestId('ver-todos-publicacoes')).toBeTruthy();
    });

    it('exibe somente o bloco selecionado ao clicar no filtro correspondente', async () => {
      const { getByPlaceholderText, getByText, queryByTestId, findByTestId, getByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-pessoas'));

      const userCard = await waitFor(() => getByTestId('user-card-1'));
      expect(userCard).toBeTruthy();

      expect(queryByTestId('group-card-2')).toBeNull();
      expect(queryByTestId('post-item-3')).toBeNull();
    });

    it('exibe somente o bloco de Grupos ao clicar no filtro Grupos', async () => {
      const { getByPlaceholderText, getByText, queryByTestId, getByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-grupos'));

      const groupCard = await waitFor(() => getByTestId('group-card-2'));
      expect(groupCard).toBeTruthy();

      expect(queryByTestId('user-card-1')).toBeNull();
      expect(queryByTestId('post-item-3')).toBeNull();
    });

    it('exibe somente o bloco de Publicações ao clicar no filtro Publicações', async () => {
      const { getByPlaceholderText, getByText, queryByTestId, getByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-publicacoes'));

      const postItem = await waitFor(() => getByTestId('post-item-3'));
      expect(postItem).toBeTruthy();

      expect(queryByTestId('user-card-1')).toBeNull();
      expect(queryByTestId('group-card-2')).toBeNull();
    });

    it('não reabre os 3 filtros ao selecionar uma categoria da pesquisa', async () => {
      mockedApi.post.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            users: [],
            groups: [
              { id: '2', name: 'Grupo React' },
              { id: '7', name: 'Grupo Node' },
              { id: '8', name: 'Grupo Design' },
            ],
            posts: [],
          },
        }),
      );

      const { getByPlaceholderText, findByText, getByTestId, queryByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'grupo');

      expect(await findByText('Filtros', {}, { timeout: 5000 })).toBeTruthy();

      // visão geral: só a seção com resultado tem filtro
      expect(getByTestId('filtro-grupos')).toBeTruthy();
      expect(queryByTestId('filtro-pessoas')).toBeNull();
      expect(queryByTestId('filtro-publicacoes')).toBeNull();

      fireEvent.press(getByTestId('filtro-grupos'));

      // ao filtrar o seletor continua restrito ao resultado da pesquisa
      await waitFor(() => expect(getByTestId('group-card-2')).toBeTruthy(), { timeout: 5000 });
      expect(getByTestId('filtro-grupos')).toBeTruthy();
      expect(queryByTestId('filtro-pessoas')).toBeNull();
      expect(queryByTestId('filtro-publicacoes')).toBeNull();
    });

    it('salva um usuário nos recentes ao clicar no card de usuário', async () => {
      const { getByPlaceholderText, getByTestId } = renderWithNavigation();
      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      const userTouchable = await waitFor(() => getByTestId('user-touchable-1'), { timeout: 5000 });
      fireEvent.press(userTouchable);
      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith('recentUsers', expect.stringContaining('João Silva'));
      });
    });

    it('exibe o botão Carregar mais quando existem mais resultados', async () => {
      const { getByPlaceholderText, getByText, findByTestId, getByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-pessoas'));

      expect(await findByTestId('carregar-mais-pessoas')).toBeTruthy();
    });

    it('carrega a próxima página e adiciona os novos resultados aos existentes', async () => {
      const { getByPlaceholderText, getByText, getByTestId, findByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-pessoas'));

      expect(await findByTestId('user-card-1')).toBeTruthy();

      fireEvent.press(getByTestId('carregar-mais-pessoas'));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/search/filter/users?page=2&limit=10', {
          input: 'joão',
        });
      });

      expect(await findByTestId('user-card-4')).toBeTruthy();
      expect(getByTestId('user-card-1')).toBeTruthy();
    });

    it('não exibe o botão Carregar mais quando não há mais resultados', async () => {
      const { getByPlaceholderText, getByText, getByTestId, findByTestId, queryByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      fireEvent.press(getByTestId('filtro-grupos'));

      expect(await findByTestId('group-card-2')).toBeTruthy();
      expect(queryByTestId('carregar-mais-grupos')).toBeNull();
    });

    it('permite pressionar o avatar de um usuário recente sem quebrar', async () => {
      const { findByTestId, getByTestId } = renderWithNavigation();

      const touchableAvatar = await findByTestId('touchable-avatar-image-1');
      fireEvent.press(touchableAvatar);

      // a tela continua montada após o press
      expect(getByTestId('input-pesquisa')).toBeTruthy();
      expect(await findByTestId('touchable-avatar-image-1')).toBeTruthy();
    });

    it('permite pressionar o nome dividido em duas linhas sem quebrar', async () => {
      const { findByTestId, getByTestId } = renderWithNavigation();

      const touchableName = await findByTestId('touchable-avatar-name1-1');
      fireEvent.press(touchableName);

      expect(getByTestId('input-pesquisa')).toBeTruthy();
      expect(await findByTestId('touchable-avatar-name1-1')).toBeTruthy();
    });
    it('exibe apenas as seções que possuem resultados', async () => {
      mockedApi.post.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            users: [],
            groups: [
              { id: '2', name: 'Grupo React' },
              { id: '7', name: 'Grupo Node' },
              { id: '8', name: 'Grupo Design' },
            ],
            posts: [],
          },
        }),
      );

      const { getByPlaceholderText, findByText, queryByText, getByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'grupo');

      expect(
        await findByText('Ver todos os resultados de Grupos', {}, { timeout: 5000 }),
      ).toBeTruthy();
      expect(getByTestId('group-card-2')).toBeTruthy();
      expect(queryByText('Ver todos os resultados de Pessoas')).toBeNull();
      expect(queryByText('Ver todos os resultados de Publicações')).toBeNull();
    });

    it('não busca quando o texto é vazio ou contém só espaços', async () => {
      const { getByPlaceholderText, getByTestId, waitForRecentes } = (() => {
        const utils = renderWithNavigation();
        return {
          ...utils,
          waitForRecentes: async () => {
            await waitFor(() => expect(utils.getByTestId('scroll-recentes')).toBeTruthy());
          },
        };
      })();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), '   ');

      await waitForRecentes();

      // espera passar o debounce (2s) para garantir que nenhuma busca é disparada
      await new Promise((resolve) => {
        setTimeout(resolve, 2500);
      });

      expect(mockedApi.post).not.toHaveBeenCalledWith('/search', { input: '   ' });
      expect(mockedApi.post).not.toHaveBeenCalledWith('/search', { input: '' });
      expect(getByTestId('scroll-recentes')).toBeTruthy();
    });

    it('exibe aviso quando a busca não encontra resultados', async () => {
      mockedApi.post.mockImplementationOnce(() =>
        Promise.resolve({ data: { users: [], groups: [], posts: [] } }),
      );

      const { getByPlaceholderText, findByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'zzz');

      expect(await findByTestId('empty-state', {}, { timeout: 5000 })).toBeTruthy();
    });

    it('exibe erro com tentar novamente quando a busca falha', async () => {
      mockedApi.post.mockImplementationOnce(() => Promise.reject(new Error('offline')));

      const { getByPlaceholderText, findByTestId, getByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      expect(await findByTestId('error-state', {}, { timeout: 5000 })).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();

      fireEvent.press(getByTestId('retry-button'));

      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();
    });

    it('mostra "Buscando..." logo ao digitar um novo termo, antes do debounce', async () => {
      const { getByPlaceholderText, getByTestId, findByTestId, queryByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');
      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'maria');

      // feedback imediato enquanto o debounce não dispara
      expect(getByTestId('loading-state')).toBeTruthy();
      expect(queryByTestId('error-state')).toBeNull();

      // a busca nova termina normalmente
      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();
    });

    it('mostra "Buscando..." na primeira busca enquanto o debounce não dispara', async () => {
      const { getByPlaceholderText, getByTestId, findByTestId } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      expect(getByTestId('loading-state')).toBeTruthy();
      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();
    });

    it('mantém os resultados e mostra aviso quando a nova busca falha', async () => {
      const { getByPlaceholderText, findByTestId, getByTestId, queryByTestId } =
        renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');
      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();

      mockedApi.post.mockImplementationOnce(() => Promise.reject(new Error('offline')));
      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'maria');

      expect(await findByTestId('stale-data-banner', {}, { timeout: 5000 })).toBeTruthy();
      expect(getByTestId('user-card-1')).toBeTruthy();
      expect(queryByTestId('error-state')).toBeNull();

      fireEvent.press(getByTestId('stale-data-refresh'));

      expect(await findByTestId('user-card-1', {}, { timeout: 5000 })).toBeTruthy();
      expect(queryByTestId('stale-data-banner')).toBeNull();
    });
  });

  describe('Usuario ADMIN', () => {
    beforeEach(() => {
      // Ajusta o mock para retornar usuário ADMIN só aqui

      mockedApi.get.mockImplementation((url: string) => {
        if (url.startsWith('/user/')) {
          return Promise.resolve({ data: { fullName: 'João Silva', sysRole: 'ADMIN' } });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('exibe botões de lixeira', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      expect(await findByTestId('user-delete-button-1')).toBeTruthy();
      expect(await findByTestId('group-delete-button-2')).toBeTruthy();
      expect(await findByTestId('post-delete-button-3')).toBeTruthy();
    });

    it('exclui um usuário ao clicar no botão lixeira e confirma', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      expect(await findByTestId('user-delete-button-1')).toBeTruthy();

      const deleteButton = await findByTestId('user-delete-button-1');
      fireEvent.press(deleteButton);

      await waitFor(
        () => {
          expect(getByText('Tem certeza que deseja excluir este usuário?')).toBeTruthy();
        },
        { timeout: 1000 },
      );

      const confirmButton = await findByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/user/1');
      });

      await waitFor(() => {
        expect(screen.queryByTestId('user-card-1')).toBeNull();
      });
    });

    it('exclui um grupo ao clicar no botão lixeira e confirma', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      expect(await findByTestId('group-delete-button-2')).toBeTruthy();

      const deleteButton = await findByTestId('group-delete-button-2');
      fireEvent.press(deleteButton);

      await waitFor(
        () => {
          expect(getByText('Tem certeza que deseja excluir este grupo?')).toBeTruthy();
        },
        { timeout: 1000 },
      );

      const confirmButton = await findByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/group/2');
      });

      await waitFor(() => {
        expect(screen.queryByTestId('group-card-2')).toBeNull();
      });
    });

    it('exclui uma publicação ao clicar no botão lixeira e confirma', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      expect(await findByTestId('post-delete-button-3')).toBeTruthy();

      const deleteButton = await findByTestId('post-delete-button-3');
      fireEvent.press(deleteButton);

      await waitFor(
        () => {
          expect(getByText('Tem certeza que deseja excluir esta publicação?')).toBeTruthy();
        },
        { timeout: 1000 },
      );

      const confirmButton = await findByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/post/3');
      });

      await waitFor(() => {
        expect(screen.queryByTestId('post-item-3')).toBeNull();
      });
    });

    it('não exclui o usuário se clicar em "Não" no alerta de confirmação', async () => {
      const { getByPlaceholderText, findByTestId, getByText } = renderWithNavigation();

      fireEvent.changeText(getByPlaceholderText('Pesquisar'), 'joão');

      await waitFor(() => expect(getByText('Filtros')).toBeTruthy(), { timeout: 3000 });

      const deleteButton = await findByTestId('user-delete-button-1');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(getByText('Tem certeza que deseja excluir este usuário?')).toBeTruthy();
      });

      const alertMock = jest.spyOn(Alert, 'alert');
      alertMock.mockImplementationOnce((title, message, buttons) => {
        const cancelButton = buttons?.find((btn) => btn.text === 'Não');
        if (cancelButton?.onPress) cancelButton.onPress();
      });

      const cancelButton = await findByTestId('cancel-delete-button');
      fireEvent.press(cancelButton);

      expect(api.delete).not.toHaveBeenCalled();

      expect(await findByTestId('user-card-1')).toBeTruthy();
    });
  });
});
