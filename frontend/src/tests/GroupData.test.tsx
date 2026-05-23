import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { mocked } from 'jest-mock';
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

const mockedApi = mocked(api);
const mockedStorage = mocked(storage);

describe('GroupData', () => {
  const mockGroupInfo = {
    name: 'test-group',
    description: 'descricao',
  };

  const mockGroupParticipants = [
    {
      role: 'LEADER', // prof
      user: { fullName: 'Prof. Albus Dumbledore' },
    },
    {
      role: 'MEMBER', // aluno
      user: { fullName: 'Harry Potter' },
    },
    {
      role: 'MEMBER', // aluno
      user: { fullName: 'Hermione Granger' },
    },
  ];

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
      if (url === `/participant/group/${mockRoute.params.groupId}`) {
        return Promise.resolve({ data: mockGroupParticipants });
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
        {
          headers: {
            Authorization: 'Bearer fake-token',
          },
        },
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
      if (url === `/participant/group/${mockRoute.params.groupId}`) {
        return Promise.resolve({ data: [] }); // Retorna array vazio
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

  it('deve renderizar os erros corretamente quando a API nao conseguir carregar os dados', () => {
    mockedApi.get.mockResolvedValue(new Promise(() => {}));

    const { getByText, getAllByText } = render(
      <NavigationContainer>
        <GroupData navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>,
    );

    // no estado inicial (antes da API retornar), o componente mostra textos de fallback
    expect(getByText('Erro')).toBeTruthy();
    expect(getByText('Erro carregar os dados')).toBeTruthy();

    // a mensagem "Vazio..." também aparece, pois `groupParticipant` ainda está indefinido
    const emptyMessages = getAllByText('Vazio...');
    expect(emptyMessages.length).toBe(2);
  });
});
