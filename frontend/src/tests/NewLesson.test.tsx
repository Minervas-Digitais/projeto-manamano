/* eslint-disable global-require */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { View } from 'react-native';
import * as fs from 'fs';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import storage from '../services/secureStorage';
import NewLesson from '../pages/NewLesson/NewLesson';
import api from '../services/api';

// Mock fonts
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(async (uri: string) => {
    const fileBuffer = fs.readFileSync(uri);
    return fileBuffer.toString('base64');
  }),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  documentDirectory: 'file://mocked/path/',
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn(),
  EventSubscription: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      type: 'success',
      assets: [
        {
          name: 'Logo.png',
          uri: 'file://mocked_logo.png',
          mimeType: 'image/png',
        },
      ],
    } as any),
  ),
}));

// Mock SVGs importados como componentes React vazios
jest.mock('../../assets/arrow-icon.svg', () => {
  return () => null;
});
jest.mock('../../assets/input-link-icon.svg', () => {
  return () => null;
});
jest.mock('../../assets/calendar-icon.svg', () => {
  return () => null;
});

jest.mock('../context/SideMenuContext', () => ({
  useSideMenu: () => ({
    isOpen: false,
    closeMenu: jest.fn(),
    openMenu: jest.fn(),
    toggleMenu: jest.fn(),
  }),
  SideMenuProvider: ({ children }: any) => children,
}));

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ loggedId: 'fake-user-id' }),
}));

// Mock do react-navigation

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const mockUseRoute = jest.fn(() => ({ params: { groupId: '123' } as any }));
  (global as any).mockUseRoute = mockUseRoute;
  return {
    ...actualNav,
    useRoute: (...args: any) => (global as any).mockUseRoute(...args),
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'fake-user-id';
      return null;
    }),
  },
}));

// Mock api
jest.mock('../services/api', () => {
  const post = jest.fn((url, data) => {
    return Promise.resolve({ data: { id: 'new-id', success: true } });
  });

  const patch = jest.fn((url, data) => {
    return Promise.resolve({ data: { id: 'patched-id', success: true } });
  });

  const get = jest.fn((url) => {
    if (url === '/category/group/123') {
      return Promise.resolve({ data: [{ id: '1', name: 'Aulas' }] });
    }
    return Promise.resolve({ data: [] });
  });

  return {
    __esModule: true,
    default: {
      post,
      patch,
      get,
      delete: jest.fn(() => Promise.resolve({ data: {} })),
    },
  };
});

// Mock Toast
jest.mock('react-native-toast-message', () => {
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
        <Stack.Screen name="NewLesson" component={NewLesson} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

describe('NewLesson', () => {
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
    (global as any).mockUseRoute.mockReturnValue({ params: { groupId: '123' } as any });
    jest.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/category/group/123') {
        return Promise.resolve({ data: [{ id: '1', name: 'Aulas' }] });
      }
      return Promise.resolve({ data: [] });
    });
    jest.mocked(api.post).mockResolvedValue({ data: { id: 'new-id', success: true } } as any);
    jest.mocked(api.patch).mockResolvedValue({ data: { id: 'patched-id', success: true } } as any);
  });

  it('renderiza corretamente o componente com os campos principais', async () => {
    const { getByTestId, queryByTestId } = renderWithNavigation();

    await waitFor(() => {
      expect(getByTestId('input-title')).toBeTruthy();
      expect(getByTestId('input-date')).toBeTruthy();
      expect(getByTestId('input-hour')).toBeTruthy();
      expect(getByTestId('input-link')).toBeTruthy();
      expect(getByTestId('input-vod')).toBeTruthy();
      expect(getByTestId('input-description')).toBeTruthy();
      expect(getByTestId('btn-add-file')).toBeTruthy();
      expect(getByTestId('btn-publish')).toBeTruthy();
    });

    expect(queryByTestId('error-title')).toBeNull();
  });

  it('deve mostrar erros ao tentar enviar formulário vazio', async () => {
    const { getByTestId, findAllByText } = renderWithNavigation();

    fireEvent.press(getByTestId('btn-publish'));
    const errors = await findAllByText('Campo obrigatório');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve chamar picker ao clicar em adicionar arquivo', async () => {
    jest.mocked(FileSystem.readAsStringAsync).mockResolvedValueOnce('base64-mockado');

    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
      canceled: false,
      assets: [{ name: 'arquivo.pdf', uri: 'file://arquivo.pdf', mimeType: 'application/pdf' }],
    } as any);

    const { getByTestId, findByTestId } = renderWithNavigation();

    fireEvent.press(getByTestId('btn-add-file'));

    expect(await findByTestId(/file-item-/)).toBeTruthy();
  });

  it('envia o formulário corretamente com dados válidos', async () => {
    jest.mocked(FileSystem.readAsStringAsync).mockResolvedValueOnce('base64-mockado');
    const { getByTestId, findByTestId } = renderWithNavigation();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/category/group/123');
    });

    fireEvent.changeText(getByTestId('input-title'), 'Aula Teste');
    fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
    fireEvent.changeText(getByTestId('input-hour'), '23:59');
    fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
    fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
    fireEvent.changeText(getByTestId('input-description'), 'Descrição da aula de teste.');

    fireEvent.press(getByTestId('btn-add-file'));
    const fileItem = await findByTestId(/file-item-/);
    expect(fileItem).toBeTruthy();

    fireEvent.press(getByTestId('btn-publish'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });
  });

  it('remove um arquivo ao clicar no card', async () => {
    jest.mocked(FileSystem.readAsStringAsync).mockResolvedValueOnce('base64-mockado');
    const { debug, getByTestId, findByTestId, queryByTestId } = renderWithNavigation();

    fireEvent.press(getByTestId('btn-add-file'));

    const fileItem = await findByTestId(/file-item-/);
    fireEvent.press(fileItem);

    await waitFor(() => {
      expect(queryByTestId(/file-item-/)).toBeNull();
    });
  });

  it('mostra erro ao falhar na seleção de arquivos', async () => {
    jest
      .mocked(DocumentPicker.getDocumentAsync)
      .mockRejectedValueOnce(new Error('Falha ao selecionar'));

    const { getByTestId } = renderWithNavigation();

    fireEvent.press(getByTestId('btn-add-file'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao selecionar os arquivos.',
        }),
      );
    });
  });

  it('mostra erro ao não selecionar nenhum arquivo', async () => {
    jest
      .mocked(DocumentPicker.getDocumentAsync)
      .mockResolvedValueOnce({ canceled: false, assets: [] } as any);

    const { getByTestId } = renderWithNavigation();

    fireEvent.press(getByTestId('btn-add-file'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Nenhum arquivo selecionado.',
        }),
      );
    });
  });

  it('mostra erro se categoria "Aulas" não for encontrada', async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      data: [{ id: '1', name: 'Outros' }],
    });
    jest.mocked(api.get).mockResolvedValueOnce({ data: [{ id: '1', name: 'Outros' }] });

    const { getByTestId } = renderWithNavigation();

    fireEvent.changeText(getByTestId('input-title'), 'Aula sem categoria Aulas');
    fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
    fireEvent.changeText(getByTestId('input-hour'), '23:59');
    fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
    fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
    fireEvent.changeText(getByTestId('input-description'), 'Descrição');

    fireEvent.press(getByTestId('btn-publish'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Categoria "Aulas" não encontrada.',
        }),
      );
    });
  });

  it('valida que data não pode ser no passado', async () => {
    const { getByTestId, findByText } = renderWithNavigation();

    fireEvent.changeText(getByTestId('input-date'), '01/01/2000');
    fireEvent.changeText(getByTestId('input-hour'), '12:00');
    fireEvent.press(getByTestId('btn-publish'));

    expect(await findByText('Data inválida')).toBeTruthy();
  });

  it('valida que horário não pode estar no passado no mesmo dia', async () => {
    const { getByTestId, findByText } = renderWithNavigation();

    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR');

    fireEvent.changeText(getByTestId('input-date'), todayStr);
    fireEvent.changeText(getByTestId('input-hour'), '00:01');

    fireEvent.press(getByTestId('btn-publish'));

    expect(await findByText('Esta hora já passou')).toBeTruthy();
  });

  it('exibe erro quando a API falha ao enviar dados da aulaa', async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      data: [{ id: '1', name: 'Aulas' }],
    });
    jest.mocked(api.post).mockRejectedValueOnce(new Error('Erro na API'));

    const { getByTestId } = renderWithNavigation();

    fireEvent.changeText(getByTestId('input-title'), 'Aula Teste');
    fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
    fireEvent.changeText(getByTestId('input-hour'), '23:59');
    fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
    fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
    fireEvent.changeText(getByTestId('input-description'), 'Descrição da aula de teste.');

    fireEvent.press(getByTestId('btn-publish'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('exibe erro quando ocorre exceção ao criar aula após obter categoria', async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      data: [{ id: '1', name: 'Aulas' }],
    });

    jest.mocked(api.post).mockImplementationOnce(() => {
      throw new Error('Erro simulado ao criar aula');
    });

    const { getByTestId } = renderWithNavigation();

    await waitFor(() => {
      expect(jest.mocked(api.get)).toHaveBeenCalledWith(`/category/group/123`);
    });

    fireEvent.changeText(getByTestId('input-title'), 'Título Teste');
    fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
    fireEvent.changeText(getByTestId('input-hour'), '23:59');
    fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
    fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
    fireEvent.changeText(getByTestId('input-description'), 'Descrição da aula');

    fireEvent.press(getByTestId('btn-publish'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao criar aula. Tente novamente mais tarde.',
        }),
      );
    });
  });

  it('mostra erro se falhar ao buscar categorias', async () => {
    jest.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/category/group/123') {
        return Promise.reject(new Error('Erro ao buscar categorias'));
      }
      return Promise.resolve({ data: [] });
    });

    jest.mocked(storage.getItem).mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'fake-user-id';
      return null;
    });

    renderWithNavigation();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Categoria não encontrada.',
        }),
      );
    });
  });

  it('deve renderizar em modo edição com botão Salvar', async () => {
    (global as any).mockUseRoute.mockReturnValue({
      params: {
        groupId: '123',
        editData: {
          id: 'lesson-1',
          title: 'Aula Edit',
          date: new Date('2099-12-31T10:00:00.000Z').toISOString(),
          urlLive: 'https://live.com/edit',
          urlVOD: 'https://vod.com/edit',
          input: 'Descricao editada',
        },
      } as any,
    } as any);

    const { getByText } = renderWithNavigation();

    await waitFor(() => {
      expect(getByText('Salvar')).toBeTruthy();
    });
  });

  it('deve chamar PATCH ao salvar em modo edição', async () => {
    (global as any).mockUseRoute.mockReturnValue({
      params: {
        groupId: '123',
        editData: {
          id: 'lesson-1',
          title: 'Aula Edit',
          date: new Date('2099-12-31T10:00:00.000Z').toISOString(),
          urlLive: 'https://live.com/edit',
          urlVOD: 'https://vod.com/edit',
          input: 'Descricao editada',
        },
      } as any,
    } as any);

    const { getByTestId } = renderWithNavigation();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/category/group/123');
    });

    fireEvent.changeText(getByTestId('input-title'), 'Aula Editada 2');
    fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
    fireEvent.changeText(getByTestId('input-hour'), '10:00');
    fireEvent.changeText(getByTestId('input-link'), 'https://live.com/edit2');
    fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/edit2');
    fireEvent.changeText(getByTestId('input-description'), 'Descricao editada 2');

    fireEvent.press(getByTestId('btn-publish'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/post/lesson-1',
        expect.objectContaining({
          title: 'Aula Editada 2',
          groupId: '123',
        }),
      );
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text1: 'Aula atualizada com sucesso!' }),
      );
    });
  });
});
