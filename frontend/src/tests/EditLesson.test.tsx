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
import EditLesson from '../pages/EditLesson/EditLesson';
import api from '../services/api';

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
  EncodingType: { Base64: 'base64' },
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
      assets: [{ name: 'novo.pdf', uri: 'file://novo.pdf', mimeType: 'application/pdf' }],
    } as any),
  ),
}));

jest.mock('../../assets/arrow-icon.svg', () => () => null);
jest.mock('../../assets/input-link-icon.svg', () => () => null);
jest.mock('../../assets/calendar-icon.svg', () => () => null);

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

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const mockUseRoute = jest.fn(() => ({ params: { lessonId: 'lesson-1' } as any }));
  (global as any).mockUseRoute = mockUseRoute;
  return {
    ...actualNav,
    useRoute: (...args: any) => (global as any).mockUseRoute(...args),
    useNavigation: () => ({ goBack: mockGoBack, navigate: jest.fn() }),
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

jest.mock('../services/api', () => {
  const post = jest.fn(() => Promise.resolve({ data: { id: 'new-archive', success: true } }));
  const patch = jest.fn(() => Promise.resolve({ data: { id: 'patched', success: true } }));
  const get = jest.fn((url: string) => {
    if (url === '/post/lesson-1') {
      return Promise.resolve({
        data: {
          id: 'lesson-1',
          groupId: 'group-123',
          title: 'Aula Original',
          schedule: new Date('2099-12-31T10:00:00.000Z').toISOString(),
          urlLive: 'https://live.com/original',
          urlRecorded: 'https://vod.com/original',
          input: 'Descricao original',
          content: 'Descricao original',
        },
      });
    }
    if (url === '/archives/post/lesson-1') {
      return Promise.resolve({
        data: [
          {
            id: 'arch-1',
            name: 'arquivo1.pdf',
            mimeType: 'application/pdf',
            contentBase64: 'cGRm',
          },
          { id: 'arch-2', name: 'imagem.png', mimeType: 'image/png', contentBase64: 'aW1hZ2U=' },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });
  return {
    __esModule: true,
    default: { post, patch, get, delete: jest.fn(() => Promise.resolve({ data: {} })) },
  };
});

jest.mock('react-native-toast-message', () => {
  const show = jest.fn();
  const hide = jest.fn();
  const ToastComponent = (props: any) => <View {...props} />;
  ToastComponent.show = show;
  ToastComponent.hide = hide;
  return { __esModule: true, default: ToastComponent, show, hide };
});

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EditLesson" component={EditLesson} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>,
  );

describe('EditLesson', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (
        typeof msg === 'string' &&
        (msg.includes('An update to') ||
          msg.includes('inside a test was not wrapped in act') ||
          msg.includes('GO_BACK') ||
          msg.includes('was not handled'))
      )
        return;
      // eslint-disable-next-line no-console
      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).mockUseRoute.mockReturnValue({ params: { lessonId: 'lesson-1' } as any });
    jest.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/post/lesson-1') {
        return Promise.resolve({
          data: {
            id: 'lesson-1',
            groupId: 'group-123',
            title: 'Aula Original',
            schedule: new Date('2099-12-31T10:00:00.000Z').toISOString(),
            urlLive: 'https://live.com/original',
            urlRecorded: 'https://vod.com/original',
            input: 'Descricao original',
            content: 'Descricao original',
          },
        } as any);
      }
      if (url === '/archives/post/lesson-1') {
        return Promise.resolve({
          data: [
            {
              id: 'arch-1',
              name: 'arquivo1.pdf',
              mimeType: 'application/pdf',
              contentBase64: 'cGRm',
            },
            { id: 'arch-2', name: 'imagem.png', mimeType: 'image/png', contentBase64: 'aW1hZ2U=' },
          ],
        } as any);
      }
      return Promise.resolve({ data: [] } as any);
    });
    jest.mocked(api.patch).mockResolvedValue({ data: { id: 'patched' } } as any);
    jest.mocked(api.post).mockResolvedValue({ data: { id: 'new-archive' } } as any);
  });

  it('carrega e renderiza formulário com dados e arquivos existentes', async () => {
    const { getByTestId, findByTestId, getByText } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('input-title')).toBeTruthy());
    expect(getByText('Salvar')).toBeTruthy();
    // arquivos existentes como ArchiveCard vertical (existing-file-)
    expect(await findByTestId('existing-file-arch-1')).toBeTruthy();
    expect(await findByTestId('existing-file-arch-2')).toBeTruthy();
    // btn add file presente
    expect(getByTestId('btn-add-file')).toBeTruthy();
  });

  it('não envia PATCH se nenhuma modificação foi feita', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('input-title')).toBeTruthy());
    // sem alterar nada, sem novos arquivos
    fireEvent.press(getByTestId('btn-publish'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info', text1: 'Nenhuma alteração detectada.' }),
      );
    });
    expect(api.patch).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('envia PATCH quando campos são alterados', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('input-title')).toBeTruthy());
    fireEvent.changeText(getByTestId('input-title'), 'Aula Editada');
    fireEvent.press(getByTestId('btn-publish'));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/post/lesson-1',
        expect.objectContaining({ title: 'Aula Editada', groupId: 'group-123' }),
      );
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text1: 'Aula atualizada com sucesso!' }),
      );
    });
  });

  it('envia apenas arquivos novos sem PATCH se só arquivos mudaram', async () => {
    jest.mocked(FileSystem.readAsStringAsync).mockResolvedValueOnce('base64novo');
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ name: 'novo.pdf', uri: 'file://novo.pdf', mimeType: 'application/pdf' }],
    } as any);
    const { getByTestId, findByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('input-title')).toBeTruthy());
    fireEvent.press(getByTestId('btn-add-file'));
    expect(await findByTestId(/file-item-/)).toBeTruthy();
    // não altera campos, só arquivo
    fireEvent.press(getByTestId('btn-publish'));
    await waitFor(() => {
      expect(api.patch).not.toHaveBeenCalled();
      expect(api.post).toHaveBeenCalledWith(
        '/archives',
        expect.objectContaining({ name: 'novo.pdf', postId: 'lesson-1' }),
      );
    });
  });

  it('permite enviar sem vod (opcional) em edição', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('input-title')).toBeTruthy());
    fireEvent.changeText(getByTestId('input-vod'), '');
    fireEvent.changeText(getByTestId('input-title'), 'Aula sem VOD edit');
    fireEvent.press(getByTestId('btn-publish'));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/post/lesson-1',
        expect.objectContaining({ urlRecorded: undefined }),
      );
    });
  });
});
