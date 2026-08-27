import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import EditGroup from '../pages/EditGroup/EditGroup';
import api from '../services/api';
import storage from '../services/secureStorage';
import localStorage from '../services/localStorage';

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    goBack: jest.fn(),
  }),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');
jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));
jest.mock('../services/localStorage', () => ({
  __esModule: true,
  default: {
    getString: jest.fn(),
  },
}));

jest.mock('../components/HeaderCustom/HeaderCustom', () => {
  function MockHeaderCustom({ text }: any) {
    return (
      <View testID="header-custom">
        <Text>{text}</Text>
      </View>
    );
  }
  return MockHeaderCustom;
});

describe('EditGroup', () => {
  const mockedApi = api as jest.Mocked<typeof api>;
  const mockedStorage = storage as any;
  const mockedLocalStorage = localStorage as any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'mock-access-token';
      return null;
    });

    mockedLocalStorage.getString.mockImplementation((key: string) => {
      if (key === 'groupId') return 'mock-group-id';
      return null;
    });

    mockedApi.get.mockResolvedValue({
      data: {
        name: 'Grupo de Teste',
        description: 'Descrição do grupo de teste',
      },
    });

    mockedApi.patch.mockResolvedValue({
      data: { success: true },
    });
  });

  it('deve renderizar corretamente todos os elementos', async () => {
    const { getByTestId, getByText } = render(
      <EditGroup navigation={{ navigate: mockedNavigate }} />,
    );

    await waitFor(() => {
      expect(getByTestId('header-custom')).toBeTruthy();
      expect(getByText('Editar Grupo')).toBeTruthy();
      expect(getByText('Salvar alterações')).toBeTruthy();
    });
  });

  it('deve carregar dados do grupo ao montar o componente', async () => {
    render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      expect(mockedStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(mockedLocalStorage.getString).toHaveBeenCalledWith('groupId');
      expect(mockedApi.get).toHaveBeenCalledWith('/group/mock-group-id', {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });
    });
  });

  it('deve preencher os campos com dados existentes do grupo', async () => {
    const { getByLabelText } = render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      const nameInput = getByLabelText('Nome do Grupo');
      expect(nameInput.props.value).toBe('Grupo de Teste');
    });

    await waitFor(() => {
      const descriptionInput = getByLabelText('Descrição do Grupo');
      expect(descriptionInput.props.value).toBe('Descrição do grupo de teste');
    });
  });

  it('deve permitir editar o nome do grupo', async () => {
    const { getByLabelText } = render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      const nameInput = getByLabelText('Nome do Grupo');
      fireEvent.changeText(nameInput, 'Novo Nome do Grupo');
      expect(nameInput.props.value).toBe('Novo Nome do Grupo');
    });
  });

  it('deve permitir editar a descrição do grupo', async () => {
    const { getByLabelText } = render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      const descriptionInput = getByLabelText('Descrição do Grupo');
      fireEvent.changeText(descriptionInput, 'Nova descrição do grupo');
      expect(descriptionInput.props.value).toBe('Nova descrição do grupo');
    });
  });

  it('deve exibir erro quando o nome excede 20 caracteres', async () => {
    const { getByLabelText, getByText } = render(
      <EditGroup navigation={{ navigate: mockedNavigate }} />,
    );

    await waitFor(() => {
      const nameInput = getByLabelText('Nome do Grupo');
      fireEvent.changeText(nameInput, 'Este é um nome muito longo que excede vinte caracteres');

      const submitButton = getByText('Salvar alterações');
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Máximo de 20 caracteres')).toBeTruthy();
    });
  });

  it('deve exibir erro quando a descrição excede 500 caracteres', async () => {
    const { getByLabelText, getByText } = render(
      <EditGroup navigation={{ navigate: mockedNavigate }} />,
    );

    const longDescription = 'a'.repeat(501);

    await waitFor(() => {
      const descriptionInput = getByLabelText('Descrição do Grupo');
      fireEvent.changeText(descriptionInput, longDescription);

      const submitButton = getByText('Salvar alterações');
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Máximo de 500 caracteres')).toBeTruthy();
    });
  });

  it('deve submeter dados válidos com sucesso', async () => {
    const { getByLabelText, getByText } = render(
      <EditGroup navigation={{ navigate: mockedNavigate }} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    const nameInput = getByLabelText('Nome do Grupo');
    const descriptionInput = getByLabelText('Descrição do Grupo');

    fireEvent.changeText(nameInput, 'Grupo Editado');
    fireEvent.changeText(descriptionInput, 'Descrição editada');

    await waitFor(() => {
      expect(nameInput.props.value).toBe('Grupo Editado');
      expect(descriptionInput.props.value).toBe('Descrição editada');
    });

    const submitButton = getByText('Salvar alterações');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        '/group/mock-group-id',
        {
          name: 'Grupo Editado',
          description: 'Descrição editada',
        },
        {
          headers: {
            Authorization: 'Bearer mock-access-token',
          },
        },
      );
    });
  });

  it('deve navegar para GroupPage após submissão bem-sucedida', async () => {
    const { getByText, getByLabelText } = render(
      <EditGroup navigation={{ navigate: mockedNavigate }} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    const submitButton = getByText('Salvar alterações');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('GroupPage', {
        groupId: 'mock-group-id',
        groupName: 'Grupo de Teste',
      });
    });
  });

  it('não deve carregar dados quando não há token de acesso', async () => {
    mockedStorage.getItem.mockResolvedValue(undefined);
    mockedLocalStorage.getString.mockReturnValue('mock-group-id');

    render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      expect(mockedApi.get).not.toHaveBeenCalled();
    });
  });

  it('não deve submeter quando não há dados de autenticação', async () => {
    mockedStorage.getItem.mockResolvedValue(undefined);
    mockedLocalStorage.getString.mockReturnValue('mock-group-id');

    const { getByText } = render(<EditGroup navigation={{ navigate: mockedNavigate }} />);

    await waitFor(() => {
      const submitButton = getByText('Salvar alterações');
      fireEvent.press(submitButton);

      expect(mockedApi.patch).not.toHaveBeenCalled();
    });
  });
});
