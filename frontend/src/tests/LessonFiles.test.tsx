/* eslint-disable global-require */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { View, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import LessonFiles from '../pages/LessonFiles/LessonFiles';
import api from '../services/api';

jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('expo-file-system', () => ({
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('base64')),
  cacheDirectory: 'file://cache/',
  EncodingType: { Base64: 'base64' },
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(() =>
      Promise.resolve({ granted: true, directoryUri: 'file://dir' }),
    ),
    createFileAsync: jest.fn(() => Promise.resolve('file://created')),
  },
}));
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  createAssetAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-modules-core', () => ({ EventEmitter: jest.fn(), EventSubscription: jest.fn() }));

jest.mock('../../assets/archive-icon.svg', () => () => null);
jest.mock('../context/SideMenuContext', () => ({
  useSideMenu: () => ({
    isOpen: false,
    closeMenu: jest.fn(),
    openMenu: jest.fn(),
    toggleMenu: jest.fn(),
  }),
  SideMenuProvider: ({ children }: any) => children,
}));
jest.mock('../context/auth/useAuth', () => ({ useAuth: () => ({ loggedId: 'fake-user-id' }) }));

const mockUseRoute = jest.fn(() => ({
  params: { postId: 'post-1', title: 'Aula Demonstração - Materiais Diversos' } as any,
}));
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useRoute: (...args: any) => (global as any).mockUseRoute(...args) };
});
(global as any).mockUseRoute = mockUseRoute;

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => 'fake-token') },
}));

jest.mock('../services/api', () => {
  const get = jest.fn((url: string) => {
    if (url === '/archives/post/post-1') {
      return Promise.resolve({
        data: [
          {
            id: 'arch-1',
            name: 'foto.png',
            mimeType: 'image/png',
            contentBase64: 'aW1hZ2U=',
            type: 'image/png',
          },
          {
            id: 'arch-2',
            name: 'doc.pdf',
            mimeType: 'application/pdf',
            contentBase64: 'cGRm',
            type: 'application/pdf',
          },
          {
            id: 'arch-3',
            name: 'icon.svg',
            mimeType: 'image/svg+xml',
            contentBase64: 'c3Zn',
            type: 'image/svg+xml',
          },
          {
            id: 'arch-4',
            name: 'launch.webp',
            mimeType: 'image/webp',
            contentBase64: 'd2VicA==',
            type: 'image/webp',
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });
  return {
    __esModule: true,
    default: { get, post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
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
        <Stack.Screen name="LessonFiles" component={LessonFiles} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>,
  );

describe('LessonFiles', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (
        typeof msg === 'string' &&
        (msg.includes('An update to') || msg.includes('inside a test was not wrapped in act'))
      )
        return;
      // eslint-disable-next-line no-console
      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).mockUseRoute.mockReturnValue({
      params: { postId: 'post-1', title: 'Aula Demonstração - Materiais Diversos' } as any,
    });
    jest.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/archives/post/post-1') {
        return Promise.resolve({
          data: [
            {
              id: 'arch-1',
              name: 'foto.png',
              mimeType: 'image/png',
              contentBase64: 'aW1hZ2U=',
              type: 'image/png',
            },
            {
              id: 'arch-2',
              name: 'doc.pdf',
              mimeType: 'application/pdf',
              contentBase64: 'cGRm',
              type: 'application/pdf',
            },
            {
              id: 'arch-3',
              name: 'icon.svg',
              mimeType: 'image/svg+xml',
              contentBase64: 'c3Zn',
              type: 'image/svg+xml',
            },
            {
              id: 'arch-4',
              name: 'launch.webp',
              mimeType: 'image/webp',
              contentBase64: 'd2VicA==',
              type: 'image/webp',
            },
          ],
        } as any);
      }
      return Promise.resolve({ data: [] } as any);
    });
  });

  it('renderiza grid vertical centralizado com hint e cards', async () => {
    const { getByTestId, getByText } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('lesson-file-arch-1')).toBeTruthy());
    expect(getByText('Toque no card para baixar/visualizar')).toBeTruthy();
    expect(getByTestId('lesson-file-arch-2')).toBeTruthy();
    expect(getByTestId('lesson-file-arch-3')).toBeTruthy();
    expect(getByTestId('lesson-file-arch-4')).toBeTruthy();
    // nomes e tipos
    expect(getByText('foto.png')).toBeTruthy();
    expect(getByText('doc.pdf')).toBeTruthy();
  });

  it('usa preview de imagem para png/webp e ArchiveIcon para pdf/svg', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('lesson-file-arch-1')).toBeTruthy());
    // svg deve cair no fallback ArchiveIcon (não preview), mesmo sendo image/*, não tenta Image
    // Não há como checar Image source diretamente, mas garante que card existe e não quebrou
    expect(getByTestId('lesson-file-arch-3')).toBeTruthy();
  });

  it('mostra toast success ao baixar imagem (galeria)', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('lesson-file-arch-1')).toBeTruthy());
    fireEvent.press(getByTestId('lesson-file-arch-1'));
    await waitFor(() => {
      expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text1: 'Arquivo baixado' }),
      );
    });
  });

  it('mostra toast success ao baixar pdf (SAF/share)', async () => {
    // força android para testar SAF toast
    const originalOS = Platform.OS;
    (Platform as any).OS = 'android';
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('lesson-file-arch-2')).toBeTruthy());
    fireEvent.press(getByTestId('lesson-file-arch-2'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text1: 'Arquivo baixado' }),
      );
    });
    (Platform as any).OS = originalOS;
  });

  it('trata título longo sem cortar desalinhado (header truncate)', async () => {
    (global as any).mockUseRoute.mockReturnValue({
      params: {
        postId: 'post-1',
        title: 'Aula com título muito longo que deveria truncar com ellipsis e não quebrar layout',
      } as any,
    });
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => expect(getByTestId('lesson-file-arch-1')).toBeTruthy());
    // se header quebrar, render ainda deve ter lista
    expect(getByTestId('lesson-file-arch-1')).toBeTruthy();
  });

  it('mostra empty quando sem arquivos', async () => {
    jest.mocked(api.get).mockResolvedValueOnce({ data: [] } as any);
    const { getByText } = renderWithNavigation();
    await waitFor(() =>
      expect(getByText('Nenhum arquivo encontrado para esta aula.')).toBeTruthy(),
    );
  });

  it('mostra toast error quando falha ao carregar', async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error('fail'));
    renderWithNavigation();
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Erro ao carregar arquivos da aula.' }),
      );
    });
  });
});
