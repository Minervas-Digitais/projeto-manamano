import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Notification from '../pages/Notification/Notification';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (callback: () => void | (() => void)) => React.useEffect(callback, []),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

jest.mock('../../assets/dotsMenuBig.svg', () => 'DotsMenuIcon');
jest.mock('../../assets/no-notification-icon.svg', () => 'NoNotificationIcon');

jest.mock('../services/api');
jest.mock('../pages/SignIn/SignIn');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

interface NotificationType {
  id: string;
  senderName: string;
  groupName: string;
  body: string;
  type: 'COMMENT' | 'WARNING' | 'FIXED';
  idContent: string | null;
  isRead: boolean;
  createdAt: string;
}

interface UserType {
  id: string;
  sysRole: 'USER' | 'ADMIN';
}

describe('Notification', () => {
  const mockUser: UserType = { id: 'user-123', sysRole: 'USER' };
  const mockAdmin: UserType = { id: 'admin-123', sysRole: 'ADMIN' };
  const mockNotifications: NotificationType[] = [
    {
      id: 'notif-1',
      senderName: 'Alice',
      groupName: 'grupo1',
      body: 'teste123',
      type: 'COMMENT',
      idContent: 'post-abc',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      senderName: 'Admin',
      groupName: 'geral',
      body: 'warning123',
      type: 'WARNING',
      idContent: null,
      isRead: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-3',
      senderName: 'Admin',
      groupName: 'geral',
      body: 'warning456',
      type: 'WARNING',
      idContent: null,
      isRead: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-4',
      senderName: 'Suporte',
      groupName: 'geral',
      body: 'fixed123',
      type: 'FIXED',
      idContent: 'fixed-abc',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'user-123';
      if (key === 'accessToken') return 'fake-token';
      return undefined;
    });

    // mockando apenas para user
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('notifications/user/')) {
        return Promise.resolve({ data: mockNotifications });
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error(`URL da API não mockada no teste: ${url}`));
    });

    mockedApi.patch.mockResolvedValue({ data: {} });
  });

  it('Deve renderizar a mensagem de sem notificacoes quando nao ha notificacoes', async () => {
    mockedApi.get.mockImplementation(async (url: string) => {
      if (url.includes('notifications/user/')) {
        return { data: [] };
      }
      if (url.includes('/user/')) {
        return { data: mockUser };
      }
      return Promise.reject(new Error(`URL da API não mockada no teste:${url}`));
    });

    const { findByText, queryByText } = render(
      <Notification navigation={{ navigate: mockedNavigate }} />,
    );

    expect(await findByText('Você não possui notificações no momento')).toBeTruthy();

    expect(queryByText('teste123')).toBeNull();
    expect(queryByText('warning123')).toBeNull();
  });

  it('Deve renderizar a lista de notificacoes para um usuario comum', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('notifications/user/')) {
        return Promise.resolve({ data: mockNotifications });
      }

      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error(`URL da API não mockada no teste: ${url}`));
    });

    const { findByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    expect(await findByText('Notificação')).toBeTruthy();
    expect(await findByText('warning123')).toBeTruthy();
    expect(await findByText('warning456')).toBeTruthy();
  });

  it('Deve navegar para a tela de Post ao clicar numa notificacao COMMENT', async () => {
    const { findByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    const notificationItem = await findByText(/comentou no seu post/i);
    fireEvent.press(notificationItem);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        'notifications/notif-1',
        { isRead: true },
        expect.any(Object),
      );
    });

    expect(mockedNavigate).toHaveBeenCalledWith('Post', { postId: 'post-abc' });
  });

  it('Deve navegar para a tela de Post ao clicar numa notificacao FIXED', async () => {
    const { findByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    const notificationItem = await findByText(/publicação foi fixada no grupo/i);
    fireEvent.press(notificationItem);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        'notifications/notif-4',
        { isRead: true },
        expect.any(Object),
      );
    });

    expect(mockedNavigate).toHaveBeenCalledWith('Post', { postId: 'fixed-abc' });
  });

  it('Deve navegar para a NotificationPage ao clicar numa notificacao WARNING', async () => {
    const { findByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    const warningItem = await findByText('warning123');
    fireEvent.press(warningItem);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        'notifications/notif-2',
        { isRead: true },
        expect.any(Object),
      );
    });

    expect(mockedNavigate).toHaveBeenCalledWith('NotificationPage');
  });

  it('Deve renderizar a tela especifica para ADMIN', async () => {
    mockedStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'admin-123';
      if (key === 'accessToken') return 'admin-fake-token';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('notifications/user/')) {
        return Promise.resolve({ data: mockNotifications });
      }

      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockAdmin });
      }
      return Promise.reject(new Error(`URL da API não mockada no teste: ${url}`));
    });

    const { getByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      expect(getByText('Comunicados')).toBeTruthy();
    });
  });

  it('Deve chamar a funcao de buscar notificacoes periodicamente', async () => {
    jest.useFakeTimers();
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<Notification navigation={mockedNavigate} />);

    await waitFor(() => {
      // useFocusEffect + primeiro fetchNotifications + fetchUserInfo
      expect(mockedApi.get).toHaveBeenCalledTimes(2);
    });

    act(() => {
      // Avanca o tempo do setInterval
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledTimes(3);
    });

    jest.useRealTimers();
  });

  it('Deve lidar com erros ao buscar as notificacoes', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockedApi.get.mockImplementation(async (url: string) => {
      if (url.includes('notifications/user/')) {
      }
      if (url.includes('/user/')) {
        return Promise.reject(new Error('Falha ao buscar usuário'));
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    render(<Notification navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao buscar informações do usuário:',
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('Deve excluir uma notificação após a confirmação do admin', async () => {
    jest.useFakeTimers();

    let currentNotifications = [...mockNotifications];
    const notifToDelete = mockNotifications[1];

    mockedStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'admin-123';
      if (key === 'accessToken') return 'admin-fake-token';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('notifications/user/')) {
        return Promise.resolve({ data: currentNotifications });
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockAdmin });
      }
      return Promise.reject(new Error(`API URL not mocked: ${url}`));
    });

    mockedApi.delete.mockImplementation(async (url) => {
      const idToDelete = url.split('/')[1];
      currentNotifications = currentNotifications.filter((n) => n.id !== idToDelete);
      return Promise.resolve({});
    });

    const { findByTestId, queryByText } = render(
      <Notification navigation={{ navigate: mockedNavigate }} />,
    );

    const optionsMenu = await findByTestId(`options-menu-${notifToDelete.id}`);
    fireEvent.press(optionsMenu);

    const deleteButton = await findByTestId(`delete-button-${notifToDelete.id}`);

    await act(async () => {
      fireEvent.press(deleteButton);
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(queryByText(notifToDelete.body)).toBeNull();
    });

    jest.useRealTimers();
  });

  it('deve exibir um alerta de erro se a deleção da notificação falhar', async () => {
    mockedStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'admin-123';
      if (key === 'accessToken') return 'admin-fake-token';
      return undefined;
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('notifications/user/')) {
        return Promise.resolve({ data: mockNotifications });
      }
      if (url.includes('/user/')) {
        return Promise.resolve({ data: mockAdmin });
      }
      return Promise.reject(new Error(`API URL not mocked: ${url}`));
    });

    mockedApi.delete.mockRejectedValue(new Error('Failed to delete'));

    const { findByTestId } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    const optionsMenu = await findByTestId(`options-menu-${mockNotifications[1].id}`);
    fireEvent.press(optionsMenu);

    const deleteButton = await findByTestId(`delete-button-${mockNotifications[1].id}`);
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao excluir notificação.',
        }),
      );
    });
  });

  it('deve navegar para a tela inicial ao clicar no botão de retorno', async () => {
    const { findByText } = render(<Notification navigation={{ navigate: mockedNavigate }} />);

    const returnButton = await findByText('Retornar para a tela inicial');
    fireEvent.press(returnButton);

    expect(mockedNavigate).toHaveBeenCalledWith('Home');
  });
});
