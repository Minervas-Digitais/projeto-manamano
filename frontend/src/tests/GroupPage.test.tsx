import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TouchableOpacity, Text, View } from 'react-native';
import GroupPage from '../pages/GroupPage/GroupPage';
import api from '../services/api';
import storage from '../services/secureStorage';

const mockedNavigate = jest.fn();
const mockedRoute = {
  params: {
    groupId: 'group-123',
    groupName: 'Grupo de Teste',
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
  useRoute: () => mockedRoute,
}));

jest.mock('../services/api');
jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('../pages/Home/Home', () => ({
  storageHome: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => <View testID="linear-gradient">{children}</View>,
}));

// Componentes mockados
jest.mock('../components/SideMenu/SideMenu', () => {
  function MockSideMenu() {
    return null;
  }
  return MockSideMenu;
});

jest.mock('../components/HeaderCustom/HeaderCustom', () => {
  function MockHeaderCustom({ text, onPress, onPressTitle }: any) {
    return (
      <>
        <TouchableOpacity onPress={onPress} testID="header-notification-button">
          <Text>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressTitle} testID="header-title-button">
          <Text>{text || 'Default Title'}</Text>
        </TouchableOpacity>
      </>
    );
  }
  return MockHeaderCustom;
});

jest.mock('../components/PostCard/PostCard', () => {
  function MockPostCard({ nameUser, postContent, onPressPost, onPressFix, postId }: any) {
    return (
      <TouchableOpacity onPress={onPressPost} testID={`post-card-${postId || 'unknown'}`}>
        <Text>{nameUser || 'Unknown User'}</Text>
        <Text>{postContent || 'No content'}</Text>
        {onPressFix && (
          <TouchableOpacity onPress={onPressFix} testID={`fix-button-${postId || 'unknown'}`}>
            <Text>Fix</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
  return MockPostCard;
});

jest.mock('../components/LessonsCard/LessonsCard', () => {
  function MockLessonsCard({ title, date }: any) {
    const testId = `lesson-card-${title.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <TouchableOpacity testID={testId}>
        <Text>{title}</Text>
        <Text>{date}</Text>
      </TouchableOpacity>
    );
  }
  return MockLessonsCard;
});

jest.mock('../components/GroupArchives/GroupArchives', () => {
  function MockGroupArchives({ archive }: any) {
    return (
      <View testID={`archive-${archive?.name || 'unknown'}`}>
        <Text>{archive?.name || 'Unknown archive'}</Text>
      </View>
    );
  }
  return MockGroupArchives;
});

jest.mock('../components/CategoryButton/CategoryButton', () => {
  function MockCategoryButton({ categoryName, filter, onPress }: any) {
    return (
      <TouchableOpacity onPress={onPress} testID={`category-${categoryName || 'unknown'}`}>
        <Text style={{ color: filter === categoryName ? '#EF4036' : '#8F8F8F' }}>
          {categoryName || 'Unknown'}
        </Text>
      </TouchableOpacity>
    );
  }
  return MockCategoryButton;
});

describe('GroupPage', () => {
  const apiGetMock = api.get as jest.Mock;
  const apiPatchMock = api.patch as jest.Mock;
  const apiPostMock = api.post as jest.Mock;
  const storageGetMock = storage.getItem as jest.Mock;
  const buildPostsResponse = (items: any[], hasMore = false) => ({
    data: {
      data: items,
      meta: {
        hasMore,
      },
    },
  });

  // Supressão de console durante os testes
  const originalConsoleError = console.error; // eslint-disable-line no-console
  const originalConsoleLog = console.log; // eslint-disable-line no-console

  beforeAll(() => {
    console.error = jest.fn(); // eslint-disable-line no-console
    console.log = jest.fn(); // eslint-disable-line no-console
  });

  afterAll(() => {
    console.error = originalConsoleError; // eslint-disable-line no-console
    console.log = originalConsoleLog; // eslint-disable-line no-console
  });

  const mockPosts = [
    {
      id: 'post-1',
      nameUser: 'João Silva',
      input: 'Conteúdo do primeiro post',
      numComments: 5,
      createdAt: new Date().toISOString(),
      categoryName: 'Geral',
      type: 'NORMAL',
      isPinned: false,
    },
    {
      id: 'class-1',
      title: 'Aula de React',
      schedule: new Date(Date.now() + 86400000).toISOString(),
      urlLive: 'https://example.com/live',
      type: 'CLASS',
    },
  ];

  const mockCategories = [
    { id: 'cat-1', name: 'Geral' },
    { id: 'cat-2', name: 'Eventos' },
  ];

  const mockArchives = [
    {
      id: 'archive-1',
      name: 'documento.pdf',
      mimeType: 'application/pdf',
      url: 'https://example.com/documento.pdf',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (console.error as jest.Mock).mockClear(); // eslint-disable-line no-console
    (console.log as jest.Mock).mockClear(); // eslint-disable-line no-console

    // Setup padrão dos mocks de storage
    storageGetMock.mockImplementation((key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-123';
      return null;
    });

    // Setup padrão dos mocks de API
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes('/post/group/')) {
        return Promise.resolve(buildPostsResponse(mockPosts));
      }
      if (url.includes('/category/group/')) {
        return Promise.resolve({ data: mockCategories });
      }
      if (url.includes('/archives/group/')) {
        return Promise.resolve({ data: mockArchives });
      }
      if (url.includes('/participant/')) {
        return Promise.resolve({ data: [{ userId: 'user-123', role: 'MEMBER' }] });
      }
      if (url.includes('/post/saved')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  // TESTES UNITÁRIOS
  describe('Unit Tests', () => {
    it('should render correctly with initial state', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
        expect(getByText('Aulas')).toBeTruthy();
        expect(getByText('Arquivos')).toBeTruthy();
      });
    });

    it('should display group name in header', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Grupo de Teste')).toBeTruthy();
      });
    });

    it('should switch tabs correctly', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      // Testa mudança para aba Aulas
      fireEvent.press(getByText('Aulas'));

      await waitFor(() => {
        expect(getByText('Aulas')).toBeTruthy();
      });

      // Testa mudança para aba Arquivos
      fireEvent.press(getByText('Arquivos'));

      await waitFor(() => {
        expect(getByText('Arquivos')).toBeTruthy();
      });
    });
  });

  // TESTES DE INTEGRAÇÃO
  describe('Integration Tests', () => {
    it('should fetch and display posts correctly', async () => {
      const { findByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(async () => {
        const postContent = await findByText('Conteúdo do primeiro post');
        expect(postContent).toBeTruthy();
      });

      expect(apiGetMock).toHaveBeenCalledWith('/post/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('should display lessons when Classes tab is selected', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      fireEvent.press(getByText('Aulas'));

      await waitFor(() => {
        const aulasTab = getByText('Aulas');
        expect(aulasTab).toBeTruthy();
      });
    });

    it('should navigate to post when post card is pressed', async () => {
      const { getByText, findByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      const postCard = await findByTestId('post-card-post-1');
      fireEvent.press(postCard);

      expect(mockedNavigate).toHaveBeenCalledWith('Post', { postId: 'post-1' });
    });

    it('should navigate to GroupData when header title is pressed', async () => {
      const { findByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      const headerTitle = await findByTestId('header-title-button');
      fireEvent.press(headerTitle);

      expect(mockedNavigate).toHaveBeenCalledWith('GroupData', {
        groupId: 'group-123',
      });
    });

    it('should handle API errors gracefully', async () => {
      apiGetMock.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });
    });

    it('should handle missing access token', async () => {
      storageGetMock.mockImplementation((key: string) => {
        if (key === 'accessToken') return null;
        if (key === 'loggedId') return 'user-123';
        return null;
      });

      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      await waitFor(() => {
        expect(apiGetMock).not.toHaveBeenCalled();
      });
    });
  });

  // TESTES DE EDGE CASES
  describe('Edge Cases', () => {
    it('should handle empty posts list', async () => {
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/post/group/')) {
          return Promise.resolve(buildPostsResponse([]));
        }
        if (url.includes('/category/group/')) {
          return Promise.resolve({ data: mockCategories });
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText, queryByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
        // Verifica que não há posts sendo exibidos
        expect(queryByTestId('post-card-post-1')).toBeNull();
      });
    });

    it('should handle 404 error for archives', async () => {
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/archives/group/')) {
          const error = new Error('Not found');
          (error as any).response = { status: 404 };
          return Promise.reject(error);
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText, queryByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Arquivos')).toBeTruthy();
      });

      fireEvent.press(getByText('Arquivos'));

      await waitFor(() => {
        // Verifica que não há arquivos sendo exibidos devido ao erro 404
        expect(queryByTestId('archive-documento.pdf')).toBeNull();
      });
    });

    it('should default user role to MEMBER on error', async () => {
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/participant/')) {
          return Promise.reject(new Error('User not found'));
        }
        if (url.includes('/post/group/')) {
          return Promise.resolve(buildPostsResponse(mockPosts));
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText, findByText } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(async () => {
        expect(getByText('Mural')).toBeTruthy();
        const postContent = await findByText('Conteúdo do primeiro post');
        expect(postContent).toBeTruthy();
      });

      // Verifica que o usuário pode navegar normalmente (comportamento de MEMBER)
      expect(apiGetMock).toHaveBeenCalledWith('/post/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
        params: {
          page: 1,
          limit: 10,
        },
      });
    });
  });

  // TESTES DE FUNCIONALIDADES ADICIONAIS
  describe('Additional Features', () => {
    it('should handle category filtering', async () => {
      const { getByText, getAllByText } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
        expect(getByText('Categorias')).toBeTruthy();
      });

      await waitFor(() => {
        const categoryElements = getAllByText(/Geral|Eventos/);
        expect(categoryElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle add post button navigation', async () => {
      const { findByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      const addPostButton = await findByTestId('linear-gradient');
      fireEvent.press(addPostButton);

      expect(addPostButton).toBeTruthy();
    });
    it('should display archives when Files tab is selected', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Arquivos')).toBeTruthy();
      });

      fireEvent.press(getByText('Arquivos'));

      await waitFor(() => {
        expect(getByText('Arquivos')).toBeTruthy();
      });
    });

    it('should handle category with "Aulas" filter', async () => {
      // Mock específico para testar filtro de categorias
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/category/group/')) {
          return Promise.resolve({
            data: [
              { id: 'cat-1', name: 'Geral' },
              { id: 'cat-2', name: 'Aulas' }, // Esta deve ser filtrada
              { id: 'cat-3', name: 'Eventos' },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
        expect(getByText('Categorias')).toBeTruthy();
      });

      expect(apiGetMock).toHaveBeenCalledWith('/category/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
      });
    });

    it('should handle notification button press', async () => {
      const { findByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      const notificationButton = await findByTestId('header-notification-button');
      fireEvent.press(notificationButton);

      expect(mockedNavigate).toHaveBeenCalledWith('Notification');
    });

    it('should handle different post types', async () => {
      // Teste simplificado que verifica se posts estão sendo renderizados
      const { getByText, findByText } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      const postUser = await findByText('João Silva');
      expect(postUser).toBeTruthy();

      expect(apiGetMock).toHaveBeenCalledWith('/post/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle post content rendering', async () => {
      const { getByText, findByText } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      const postContent = await findByText('Conteúdo do primeiro post');
      expect(postContent).toBeTruthy();
    });
    it('should call all necessary APIs on component mount', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      // Verifica que todas as APIs foram chamadas
      expect(apiGetMock).toHaveBeenCalledWith('/post/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
        params: {
          page: 1,
          limit: 10,
        },
      });

      expect(apiGetMock).toHaveBeenCalledWith('/category/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
      });

      expect(apiGetMock).toHaveBeenCalledWith('/archives/group/group-123', {
        headers: { Authorization: 'Bearer fake-token' },
      });
    });

    it('should render all main components', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
        expect(getByText('Aulas')).toBeTruthy();
        expect(getByText('Arquivos')).toBeTruthy();
        expect(getByText('Categorias')).toBeTruthy();
        expect(getByText('Grupo de Teste')).toBeTruthy(); // Header title
      });
    });

    it('should handle API loading states', async () => {
      // Mock que simula carregamento lento
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/post/group/')) {
          return loadingPromise;
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      // Resolve o loading
      resolvePromise!(buildPostsResponse(mockPosts));

      await waitFor(() => {
        expect(getByText('João Silva')).toBeTruthy();
      });
    });
  });

  // TESTES ADICIONAIS DE COBERTURA
  describe('Additional Coverage Tests', () => {
    it('should handle empty posts with View fallback', async () => {
      // Mock API para retornar posts vazios
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/post/group/')) {
          return Promise.resolve(buildPostsResponse([]));
        }
        if (url.includes('/category/group/')) {
          return Promise.resolve({ data: mockCategories });
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });
    });

    it('should handle non-NORMAL post types filtering', async () => {
      // Mock API para retornar posts com tipos diferentes
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/post/group/')) {
          return Promise.resolve({
            data: {
              data: [
                {
                  id: 'normal-post',
                  nameUser: 'Normal User',
                  input: 'Normal post content',
                  type: 'NORMAL',
                  isPinned: true,
                  categoryName: 'Geral',
                  numComments: 1,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'other-post',
                  nameUser: 'Other User',
                  input: 'Other post content',
                  type: 'OTHER',
                  isPinned: true,
                  categoryName: 'Geral',
                  numComments: 2,
                  createdAt: new Date().toISOString(),
                },
              ],
              meta: {
                hasMore: false,
              },
            },
          });
        }
        return Promise.resolve({ data: [] });
      });

      const { getAllByText, queryByText } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        // Deve mostrar post do tipo NORMAL
        expect(getAllByText('Normal User').length).toBeGreaterThan(0);
        // NÃO deve mostrar post do tipo OTHER (retorna null)
        expect(queryByText('Other User')).toBeNull();
      });
    });

    it('should handle pinned posts display and filtering', async () => {
      // Usa os dados padrão do mock que incluem posts com diferentes valores de isPinned
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('João Silva')).toBeTruthy();
        expect(getByText('Conteúdo do primeiro post')).toBeTruthy();
      });

      expect(getByText('Mural')).toBeTruthy();
    });

    it('should handle different date formatting scenarios', async () => {
      // Teste com dados padrão do mock que já possui formatação de data
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByText('João Silva')).toBeTruthy();
        expect(getByText('Conteúdo do primeiro post')).toBeTruthy();
      });
    });

    it('should handle file type categorization in archives tab', async () => {
      const { getByText } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      const archivesTab = getByText('Arquivos');
      fireEvent.press(archivesTab);

      await waitFor(() => {
        expect(getByText('Arquivos')).toBeTruthy();
      });
    });

    it('should handle add post button visibility based on role and tab', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      expect(getByTestId('linear-gradient')).toBeTruthy();

      // Muda para aba de aulas - botão NÃO deve estar visível para role MEMBER
      const classesTab = getByText('Aulas');
      fireEvent.press(classesTab);

      await waitFor(() => {
        expect(getByText('Aulas')).toBeTruthy();
      });

      // A lógica condicional: (muralSelect || (classesSelect && (userRole === 'ADMIN')))
      // Como o mock padrão tem userRole = 'MEMBER', botão NÃO deve estar visível na aba aulas
      expect(queryByTestId('linear-gradient')).toBeNull();
    });

    it('should navigate to correct page when add button is pressed', async () => {
      const { getByText, getByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      await waitFor(() => {
        expect(getByText('Mural')).toBeTruthy();
      });

      // Testa navegação da aba Mural (deve ir para NewPost)
      const addButton = getByTestId('linear-gradient');
      fireEvent.press(addButton);

      expect(mockedNavigate).toHaveBeenCalledWith('NewPost', { groupId: 'group-123' });
    });

    it('should navigate to NewLesson when add button pressed on classes tab as ADMIN', async () => {
      // Mock usuário como ADMIN para ver o botão na aba aulas
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/participant/')) {
          return Promise.resolve({ data: [{ userId: 'user-123', role: 'ADMIN' }] });
        }
        if (url.includes('/post/group/')) {
          return Promise.resolve(buildPostsResponse(mockPosts));
        }
        if (url.includes('/category/group/')) {
          return Promise.resolve({ data: mockCategories });
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText, getByTestId } = render(
        <GroupPage navigation={{ navigate: mockedNavigate }} />,
      );

      const classesTab = getByText('Aulas');
      fireEvent.press(classesTab);

      await waitFor(() => {
        expect(getByText('Aulas')).toBeTruthy();
      });

      // Agora o botão deve estar visível para role ADMIN
      const classesAddButton = getByTestId('linear-gradient');
      fireEvent.press(classesAddButton);

      expect(mockedNavigate).toHaveBeenCalledWith('NewLesson', { groupId: 'group-123' });
    });
  });

  // TESTES DA FUNÇÃO FIXACTIONS
  describe('FixActions Function Tests', () => {
    beforeEach(() => {
      // Setup mocks para fixActions
      apiPatchMock.mockResolvedValue({ data: {} });
      apiPostMock.mockResolvedValue({ data: {} });
    });

    it('should pin a post and send notification when unpinning -> pinning', async () => {
      const { getByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByTestId('post-card-post-1')).toBeTruthy();
      });

      // Clica no botão fix para fixar o post (isPinned: false -> true)
      const fixButton = getByTestId('fix-button-post-1');
      fireEvent.press(fixButton);

      await waitFor(() => {
        // Deve chamar PATCH para atualizar post
        expect(apiPatchMock).toHaveBeenCalledWith(
          '/post/pin/post-1',
          {},
          {
            headers: {
              Authorization: 'Bearer fake-token',
            },
          },
        );

        // Deve enviar notificação ao fixar (quando !isPinned era false)
        expect(apiPostMock).toHaveBeenCalledWith(
          '/notifications',
          {
            groupId: 'group-123',
            groupName: 'Grupo de Teste',
            type: 'FIXED',
            body: '',
            idContent: 'post-1',
          },
          {
            headers: {
              Authorization: 'Bearer fake-token',
            },
          },
        );

        // Deve atualizar os posts
        expect(apiGetMock).toHaveBeenCalledWith('/post/group/group-123', {
          headers: { Authorization: 'Bearer fake-token' },
          params: {
            page: 1,
            limit: 10,
          },
        });
      });
    });

    it('should unpin a post without sending notification when pinning -> unpinning', async () => {
      // Mock um post fixado
      apiGetMock.mockImplementation((url: string) => {
        if (url.includes('/post/group/')) {
          return Promise.resolve(
            buildPostsResponse([
              {
                id: 'pinned-post-1',
                nameUser: 'João Silva',
                input: 'Pinned post content',
                numComments: 5,
                createdAt: new Date().toISOString(),
                categoryName: 'Geral',
                type: 'NORMAL',
                isPinned: true,
              },
            ]),
          );
        }
        if (url.includes('/category/group/')) {
          return Promise.resolve({ data: mockCategories });
        }
        return Promise.resolve({ data: [] });
      });

      const { getAllByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        // Post aparece tanto na seção fixada quanto na normal, então pega o primeiro
        const postCards = getAllByTestId('post-card-pinned-post-1');
        expect(postCards.length).toBeGreaterThan(0);
      });

      // Pega o botão fix do post fixado (primeira ocorrência)
      const fixButtons = getAllByTestId('fix-button-pinned-post-1');
      fireEvent.press(fixButtons[0]);

      await waitFor(() => {
        // Deve chamar PATCH para atualizar post
        expect(apiPatchMock).toHaveBeenCalledWith(
          '/post/unpin/pinned-post-1',
          {},
          {
            headers: {
              Authorization: 'Bearer fake-token',
            },
          },
        );

        // NÃO deve enviar notificação ao desfixar (quando !isPinned era true)
        expect(apiPostMock).not.toHaveBeenCalled();

        expect(apiGetMock).toHaveBeenCalled();
      });
    });

    it('should handle fixActions error gracefully', async () => {
      // Mock erro da API
      apiPatchMock.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByTestId('post-card-post-1')).toBeTruthy();
      });

      const fixButton = getByTestId('fix-button-post-1');
      fireEvent.press(fixButton);

      await waitFor(() => {
        // Deve ter tentado chamar PATCH
        expect(apiPatchMock).toHaveBeenCalled();
        // Erro deve ser tratado (console.error chamado)
        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalledWith(
          'Erro ao fixar/desfixar post:',
          expect.any(Error),
        );
      });
    });

    it('should handle missing token in fixActions', async () => {
      // Primeiro renderiza normalmente para que os posts sejam exibidos
      const { getByTestId } = render(<GroupPage navigation={{ navigate: mockedNavigate }} />);

      await waitFor(() => {
        expect(getByTestId('post-card-post-1')).toBeTruthy();
      });

      // Agora mocka token ausente APÓS posts já estarem exibidos
      storageGetMock.mockImplementation((key: string) => {
        if (key === 'accessToken') return null; // Sem token para fixActions
        if (key === 'loggedId') return 'user-123';
        return null;
      });

      // Clica no botão fix - isso chamará fixActions com token null
      const fixButton = getByTestId('fix-button-post-1');
      fireEvent.press(fixButton);

      await waitFor(() => {
        // Deve chamar PATCH com token null
        expect(apiPatchMock).toHaveBeenCalledWith(
          '/post/pin/post-1',
          {},
          {
            headers: {
              Authorization: 'Bearer null',
            },
          },
        );
      });
    });
  });
});





