import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GroupData from '../pages/GroupData/GroupData';
import api from '../services/api';
import storage from '../services/secureStorage';

jest.mock('expo-font', () => ({
  useFonts: () => [true], // Simula que as fontes já foram carregadas
}));

jest.mock('../services/api');
jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
const mockRoute = {
  params: {
    groupId: 'test-group-id',
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockRoute,
}));

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ loggedId: 'user-logged-id' }),
}));

const mockedApi = jest.mocked(api);
const mockedStorage = jest.mocked(storage);

describe('GroupData', () => {
  const mockGroupInfo = {
    name: 'test-group',
    description: 'descricao',
  };

  const mockGroupParticipants = [
    {
      userId: 'prof-1',
      role: 'INSTRUCTOR', // prof
      user: { fullName: 'Prof. Albus Dumbledore' },
    },
    {
      userId: 'student-1',
      role: 'MEMBER', // aluno
      user: { fullName: 'Harry Potter' },
    },
    {
      userId: 'student-2',
      role: 'MEMBER', // aluno
      user: { fullName: 'Hermione Granger' },
    },
  ];

  const membersPage = (participants: any[]) => ({
    data: participants,
    meta: { page: 1, lastPage: 1, total: participants.length },
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'fake-token';
      if (key === 'loggedId') return 'user-logged-id';
      return null;
    });

    mockedApi.get.mockImplementation((url: string): Promise<any> => {
      if (url === `/group/${mockRoute.params.groupId}`) {
        return Promise.resolve({ data: mockGroupInfo });
      }
      if (url === '/user/user-logged-id') {
        return Promise.resolve({ data: { sysRole: 'ADMIN' } });
      }
      if (url === `/participant/group/${mockRoute.params.groupId}/users`) {
        return Promise.resolve({ data: membersPage(mockGroupParticipants) });
      }
      return Promise.reject(new Error('URL não encontrada'));
    });
  });

  it('Deve renderizar corretamente os dados dos grupos e participantes', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByText('test-group')).toBeTruthy();
      expect(getByText('descricao')).toBeTruthy();
      expect(getByText('Prof. Albus Dumbledore')).toBeTruthy();
      expect(getByText('Harry Potter')).toBeTruthy();
      expect(getByText('Hermione Granger')).toBeTruthy();
    });
  });

  it('deve navegar para EditGroup quando o botao de editar grupo for clicado', async () => {
    const { findByText, getByTestId } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    // espera o nome do grupo aparecer para garantir que o componente está pronto
    await findByText('test-group');

    fireEvent.press(getByTestId('edit-group-button'));

    expect(mockNavigate).toHaveBeenCalledWith('EditGroup');
  });

  it('deve chamar o endpoint de deletar e voltar pra home quando sair do grupo', async () => {
    // mock para a chamada DELETE, esperando que ela seja bem-sucedida
    mockedApi.delete.mockResolvedValue({ status: 204 });

    const { findByText, getByTestId } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    const leaveButton = await findByText('Sair do Grupo');

    fireEvent.press(leaveButton);

    const confirmationText = await findByText('Tem certeza que deseja sair do grupo?');
    expect(confirmationText).toBeTruthy();

    const confirmButton = getByTestId('confirm-delete-button'); // ajuste o texto se for diferente
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(
        `/participant/group/${mockRoute.params.groupId}`,
      );
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  it('deve mostrar "Vazio..." quando nao tiver participantes', async () => {
    mockedApi.get.mockImplementation((url: string): Promise<any> => {
      if (url === `/group/${mockRoute.params.groupId}`) {
        return Promise.resolve({ data: mockGroupInfo });
      }
      if (url === '/user/user-logged-id') {
        return Promise.resolve({ data: { sysRole: 'ADMIN' } });
      }
      if (url === `/participant/group/${mockRoute.params.groupId}/users`) {
        return Promise.resolve({ data: membersPage([]) }); // Retorna lista vazia
      }
      return Promise.reject(new Error('URL não encontrada'));
    });

    const { findAllByText } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    const emptyMessages = await findAllByText('Vazio...');
    expect(emptyMessages.length).toBe(2); // dois pq aparece o para docentes e de colegas
  });

  it('deve mostrar o estado de carregamento enquanto a API nao responde', () => {
    mockedApi.get.mockResolvedValue(new Promise(() => {}));

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    // no estado inicial (antes da API retornar), o cabeçalho mostra textos de fallback
    expect(getByText('Erro')).toBeTruthy();
    expect(getByText('Erro carregar os dados')).toBeTruthy();

    // a lista de membros mostra o estado de loading
    const loadingMessages = getAllByTestId('loading-state');
    expect(loadingMessages.length).toBe(2); // docentes e colegas
  });

  it('deve mostrar apenas o aviso e o botao de tentar novamente quando o grupo falha sem dados', async () => {
    mockedApi.get.mockImplementation((url: string): Promise<any> => {
      if (url.startsWith('/group/')) {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve({ data: {} });
    });

    const { findByTestId, getByTestId, queryByText } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    expect(await findByTestId('error-state', {}, { timeout: 5000 })).toBeTruthy();
    expect(getByTestId('retry-button')).toBeTruthy();
    expect(queryByText('Membros')).toBeNull();
    expect(queryByText('Editar')).toBeNull();
  });
});
