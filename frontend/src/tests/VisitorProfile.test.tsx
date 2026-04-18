import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import VisitorProfile from '../pages/VisitorProfile/VisitorProfile';
import api from '../services/api';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  ...jest.requireActual('react-native/Libraries/Share/Share'),
  share: jest.fn(),
}));

jest.mock('react-native-toast-message', () => {
  const MockToast = () => {
    const { View } = require('react-native');
    return <View testID="mock-toast" />;
  };

  MockToast.show = jest.fn();

  return MockToast;
});

jest.mock('../components/SideMenu/SideMenu', () => (props: any) => {
  const { View } = require('react-native');
  return <View testID="mock-sidemenu" {...props} />;
});

jest.mock('../components/PostCard/PostCard', () => (props: any) => {
  const { View } = require('react-native');
  return <View testID="mock-postcard" {...props} />;
});

const mockNavigation = {
  navigate: jest.fn(),
};

const mockRoute = {
  params: { id: '123' }, // fornece um userId para o componente
};

// simulação do useRoute
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockRoute,
}));

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue('fake-access-token'),
  },
}));

describe('VisitorProfile', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockClipboard = Clipboard as jest.Mocked<typeof Clipboard>;
  const mockImageBinary = Buffer.from('mock-image-binary');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve exibir o indicador de carregamento enquanto busca os dados', () => {
    mockApi.get.mockImplementation(() => new Promise(() => {}));

    const { getByTestId } = render(<VisitorProfile navigation={{ navigate: mockNavigation }} />);

    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('Deve renderizar a pagina corretamente', async () => {
    const mockUser = {
      id: 123,
      fullName: 'TesteUser',
      neighborhood: 'Centro',
      enterprise: 'Teste Cia.',
      bio: 'Dev React Native',
      phone: '123456789',
      email: 'user.teste@example.com',
    };

    const mockPosts = [
      { id: 'p1', input: 'primeiro post', createdAt: new Date().toISOString() },
      { id: 'p2', input: 'segundo post', createdAt: new Date().toISOString() },
    ];

    mockApi.get.mockImplementation((url) => {
      if (url.includes(`/user/${mockRoute.params.id}/profile-picture`)) {
        return Promise.resolve({ data: mockImageBinary });
      }
      if (url.includes(`/user/${mockRoute.params.id}`)) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes(`/post/${mockRoute.params.id}/posts`)) {
        return Promise.resolve({ data: mockPosts });
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    const { getByText, getAllByTestId } = render(
      <VisitorProfile navigation={{ navigate: mockNavigation }} />,
    );

    await waitFor(() => {
      expect(getByText('TesteUser')).toBeTruthy();
      expect(getByText('Centro')).toBeTruthy();
      expect(getByText('Teste Cia.')).toBeTruthy();
      expect(getByText('Dev React Native')).toBeTruthy();
      expect(getAllByTestId('mock-postcard')).toHaveLength(2);
    });
  });

  it('deve exibir mensagem de "usuário não encontrado" se a API falhar', async () => {
    mockApi.get.mockRejectedValue(new Error('User not found'));

    const { getByText } = render(<VisitorProfile navigation={{ navigate: mockNavigation }} />);

    await waitFor(() => {
      expect(getByText('Usuário não encontrado')).toBeTruthy();
      expect(getByText('Este usuário não existe ou teve seu perfil removido.')).toBeTruthy();
    });
  });

  it('deve exibir mensagem apropriada se o usuário não tiver posts', async () => {
    const mockUser = { fullName: 'Teste User' };

    // usuário encontrado, mas a API de posts retorna um array vazio
    mockApi.get.mockImplementation((url) => {
      if (url.includes(`/user/${mockRoute.params.id}/profile-picture`)) {
        return Promise.resolve({ data: mockImageBinary });
      }
      if (url.includes(`/user/${mockRoute.params.id}`)) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes(`/post/${mockRoute.params.id}/posts`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    const { getByText, queryAllByTestId } = render(
      <VisitorProfile navigation={{ navigate: mockNavigation }} />,
    );

    await waitFor(() => {
      expect(getByText('Este usuário ainda não fez publicações.')).toBeTruthy();
      expect(queryAllByTestId('mock-postcard').length).toBe(0);
    });
  });

  it('Deve abrir/fechar o menu lateral ao apertar o botao', async () => {
    mockApi.get.mockImplementation((url) => {
      if (url.includes(`/user/${mockRoute.params.id}/profile-picture`)) {
        return Promise.resolve({ data: mockImageBinary });
      }
      if (url.includes(`/user/${mockRoute.params.id}`)) {
        return Promise.resolve({ data: { id: '123', fullName: 'Test User' } });
      }
      if (url.includes(`/post/${mockRoute.params.id}/posts`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    const { getByTestId, findByTestId } = render(
      <VisitorProfile navigation={{ navigate: mockNavigation }} />,
    );

    const sideMenuComponente = await findByTestId('mock-sidemenu');
    // o menu lateral tem que ta ativo
    expect(sideMenuComponente.props.display).toBe(true);

    const menuButton = getByTestId('menu-toggle-button');
    fireEvent.press(menuButton);

    expect(getByTestId('mock-sidemenu').props.display).toBe(false);

    fireEvent.press(menuButton);
    expect(getByTestId('mock-sidemenu').props.display).toBe(true);
  });

  it('deve chamar a função de copiar para o clipboard com o email', async () => {
    const mockUser = {
      id: 123,
      fullName: 'TesteUser',
      neighborhood: 'Centro',
      enterprise: 'Teste Cia.',
      bio: 'Dev React Native',
      phone: '123456789',
      email: 'user.teste@example.com',
    };

    mockApi.get.mockImplementation((url) => {
      if (url.includes(`/user/${mockRoute.params.id}/profile-picture`)) {
        return Promise.resolve({ data: mockImageBinary });
      }
      if (url.includes(`/user/${mockRoute.params.id}`)) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes(`/post/${mockRoute.params.id}/posts`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    const { findByTestId } = render(<VisitorProfile navigation={{ navigate: mockNavigation }} />);

    // encontra o botao de copiar o email
    const emailButton = await findByTestId('email-button');

    fireEvent.press(emailButton);

    await waitFor(() => {
      const Toast = require('react-native-toast-message');
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Email copiado!',
      });
    });

    expect(mockClipboard.setStringAsync).toHaveBeenCalledWith('user.teste@example.com');
  });

  it('deve chamar a função de compartilhar ao clicar no botão de compartilhar', async () => {
    mockApi.get.mockImplementation((url) => {
      if (url.includes(`/user/${mockRoute.params.id}/profile-picture`)) {
        return Promise.resolve({ data: mockImageBinary });
      }
      if (url.includes(`/user/${mockRoute.params.id}`)) {
        return Promise.resolve({ data: { fullName: 'Test User' } });
      }
      if (url.includes(`/post/${mockRoute.params.id}/posts`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`URL não mockada: ${url}`));
    });

    const { findByTestId } = render(<VisitorProfile navigation={{ navigate: mockNavigation }} />);

    // pega o botao de compartilhar
    const shareButton = await findByTestId('share-button');

    fireEvent.press(shareButton);

    expect(Share.share).toHaveBeenCalledWith({
      message: `Confira este perfil: manamano://visitorprofile/${mockRoute.params.id}`,
    });
  });
});






