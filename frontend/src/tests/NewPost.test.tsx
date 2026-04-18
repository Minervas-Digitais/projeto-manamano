import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import storage from '../services/secureStorage';
import NewPost from '../pages/NewPost/NewPost';

const originalGetDocumentAsync = require('expo-document-picker').getDocumentAsync;

// MOCKS
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('react-native-toast-message', () => {
  const MockToast = (props: any) => <></>;
  MockToast.show = jest.fn();
  return {
    __esModule: true,
    default: MockToast,
  };
});

jest.mock('../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { id: 'post-1' } })),
}));

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      assets: [
        {
          uri: 'file://mock.pdf',
          name: 'mock.pdf',
          mimeType: 'application/pdf',
        },
      ],
    }),
  ),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('base64mock')),
  EncodingType: { Base64: 'base64' },
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    params: { groupId: 'group-123' },
  }),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock das funções de validação para evitar problemas com refs
jest.mock('../pages/NewPost/NewPost', () => {
  const originalModule = jest.requireActual('../pages/NewPost/NewPost');
  return {
    __esModule: true,
    ...originalModule,
    validateDateInternal: jest.fn(() => true),
    validateHourInternal: jest.fn(() => true),
  };
});

describe('NewPost Page', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('Erro ao enviar publicação:') ||
          message.includes('Erro ao selecionar os arquivos:'))
      ) {
        return;
      }
      originalConsoleError(...args);
    });

    jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        message.includes('[styled-components/native] The value "fit-content"')
      ) {
        return;
      }
      originalConsoleWarn(...args);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const mockedStorage = storage as any;
    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'loggedId') return 'admin-123';
      if (key === 'accessToken') return 'fake-token';
      return null;
    });
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/category/group/')) {
        return Promise.resolve({
          data: [
            { id: 'cat-1', name: 'Geral', type: 'NORMAL' },
            { id: 'cat-2', name: 'Evento', type: 'EVENT' },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('should render NewPost page and categories', async () => {
    const { getByText, getByLabelText, findByText } = render(<NewPost />);
    expect(await findByText('Geral')).toBeTruthy();
    expect(await findByText('Evento')).toBeTruthy();
    expect(getByText('Categoria')).toBeTruthy();
    expect(getByLabelText('Publicar')).toBeTruthy();
    expect(getByText('Publicação')).toBeTruthy();
  });

  it('should show error if trying to submit without input', async () => {
    const { getByLabelText, findByText } = render(<NewPost />);
    await findByText('Geral');
    fireEvent.press(getByLabelText('Publicar'));
    expect(await findByText('Campo obrigatório')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('should submit a normal post with input and show success toast', async () => {
    const { getByText, getByLabelText } = render(<NewPost navigation={{ goBack: mockGoBack }} />);
    await waitFor(() => getByText('Geral'));
    const input = getByLabelText('Mensagem');
    fireEvent.changeText(input, 'Conteúdo do post');
    fireEvent.press(getByText('Publicar'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/post',
        expect.objectContaining({
          type: 'NORMAL',
          input: 'Conteúdo do post',
          groupId: 'group-123',
        }),
        expect.any(Object),
      );
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should show error toast if API fails', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    const { getByText, getByLabelText } = render(<NewPost />);
    await waitFor(() => getByText('Geral'));
    const input = getByLabelText('Mensagem');
    fireEvent.changeText(input, 'Testando input');
    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao enviar publicação. Tente novamente mais tarde.',
        }),
      );
    });
  });

  it('should render event fields when Evento is selected', async () => {
    const { getByText, getByLabelText } = render(<NewPost />);
    await waitFor(() => getByText('Evento'));
    fireEvent.press(getByText('Evento'));
    expect(getByLabelText('Título')).toBeTruthy();
    expect(getByLabelText('Data')).toBeTruthy();
    expect(getByLabelText('Horário')).toBeTruthy();
    expect(getByLabelText('Descrição')).toBeTruthy();
  });

  it('should show error if trying to submit event post without required fields', async () => {
    const { getByText, findAllByText } = render(<NewPost />);
    await waitFor(() => getByText('Evento'));
    fireEvent.press(getByText('Evento'));
    fireEvent.press(getByText('Publicar'));
    const errorMessages = await findAllByText(/campo obrigatório/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should show error if trying to submit event post with invalid hour', async () => {
    const { getByText, getByLabelText, findByText } = render(<NewPost />);
    await waitFor(() => getByText('Evento'));

    fireEvent.press(getByText('Evento'));
    fireEvent.changeText(getByLabelText('Título'), 'Título do Evento');
    fireEvent.changeText(getByLabelText('Data'), '01/01/2099');
    fireEvent.changeText(getByLabelText('Horário'), '99:99');
    fireEvent.changeText(getByLabelText('Descrição'), 'Descrição do evento');
    fireEvent.press(getByText('Publicar'));

    const errorMessage = await findByText('Hora inválida');
    expect(errorMessage).toBeTruthy();
  });

  it('should show toast error if file picking fails', async () => {
    require('expo-document-picker').getDocumentAsync.mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const { getByTestId, findByText } = render(<NewPost />);
    await findByText('Geral');
    const attachButton = getByTestId('attach-file-button');
    fireEvent.press(attachButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
    // Restaure o mock original para não afetar outros testes
    require('expo-document-picker').getDocumentAsync.mockImplementation(originalGetDocumentAsync);
  });

  it('should show toast error if no file is picked', async () => {
    require('expo-document-picker').getDocumentAsync.mockResolvedValueOnce({ assets: [] });
    const { getByTestId, findByText } = render(<NewPost />);
    // Aguarde a categoria "Geral" aparecer
    await findByText('Geral');

    const attachButton = getByTestId('attach-file-button');
    fireEvent.press(attachButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('should call goBack after successful post', async () => {
    const { getByText, getByLabelText } = render(<NewPost navigation={{ goBack: mockGoBack }} />);
    await waitFor(() => getByText('Geral'));
    const input = getByLabelText('Mensagem');
    fireEvent.changeText(input, 'Conteúdo do post');
    fireEvent.press(getByText('Publicar'));
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should submit an event post with all fields and show success toast', async () => {
    const { getByText, getByLabelText } = render(<NewPost navigation={{ goBack: mockGoBack }} />);
    await waitFor(() => getByText('Evento'));

    fireEvent.press(getByText('Evento'));
    fireEvent.changeText(getByLabelText('Título'), 'Título do Evento');
    fireEvent.changeText(getByLabelText('Data'), '01/01/2099');
    fireEvent.changeText(getByLabelText('Horário'), '12:00');
    fireEvent.changeText(getByLabelText('Descrição'), 'Descrição do evento');
    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/post',
        expect.objectContaining({
          type: 'EVENT',
          title: 'Título do Evento',
        }),
        expect.any(Object),
      );
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should show error if category not found', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
    (api.post as jest.Mock).mockClear();

    const { getByText, getByLabelText } = render(<NewPost navigation={{ goBack: mockGoBack }} />);
    await waitFor(() => getByText('Categoria'));

    const input = getByLabelText('Mensagem');
    fireEvent.changeText(input, 'Teste sem categoria');
    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      // Verifica se o toast de erro correto foi exibido
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Categoria não encontrada.' }),
      );
    });

    // Garante que a chamada de postagem NUNCA foi feita
    expect(api.post).not.toHaveBeenCalled();
  });

  it('should show error if event date is invalid', async () => {
    const { getByText, getByLabelText, findByText } = render(<NewPost />);
    await waitFor(() => getByText('Evento'));
    fireEvent.press(getByText('Evento'));
    fireEvent.changeText(getByLabelText('Título'), 'Título do Evento');
    fireEvent.changeText(getByLabelText('Data'), '01/01/2000');
    fireEvent.changeText(getByLabelText('Horário'), '12:00');
    fireEvent.changeText(getByLabelText('Descrição'), 'Descrição do evento');
    fireEvent.press(getByText('Publicar'));
    expect(await findByText('Data inválida')).toBeTruthy();
  });
});





