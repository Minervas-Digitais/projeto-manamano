import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import EditGroup from '../pages/EditGroup/EditGroup';
import api from '../services/api';

const mockedNavigate = jest.fn();
const mockedGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  (global as any).mockEditGroupRoute = jest.fn(() => ({
    params: { groupId: 'mock-group-id' },
  }));
  return {
    ...actualNav,
    useRoute: (...args: any[]) => (global as any).mockEditGroupRoute(...args),
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

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('../services/api');

let mockLoggedId: string | undefined = 'user-123';

jest.mock('../context/auth/useAuth', () => ({
  useAuth: () => ({ loggedId: mockLoggedId }),
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

  const renderScreen = () =>
    render(<EditGroup navigation={{ navigate: mockedNavigate, goBack: mockedGoBack }} />);

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedId = 'user-123';
    (global as any).mockEditGroupRoute.mockReturnValue({
      params: { groupId: 'mock-group-id' },
    });

    mockedApi.get.mockResolvedValue({
      data: {
        id: 'mock-group-id',
        name: 'Grupo de Teste',
        description: 'Descrição do grupo de teste',
      },
    } as any);

    mockedApi.patch.mockResolvedValue({
      data: { success: true },
    } as any);
  });

  it('deve renderizar corretamente todos os elementos', async () => {
    const { getByTestId, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('header-custom')).toBeTruthy();
      expect(getByText('Editar Grupo')).toBeTruthy();
      expect(getByText('Salvar alterações')).toBeTruthy();
    });
  });

  it('deve carregar os dados do grupo informado na rota', async () => {
    renderScreen();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/group/mock-group-id');
    });
  });

  it('deve preencher os campos com dados existentes do grupo', async () => {
    const { getByLabelText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
      expect(getByLabelText('Descrição do Grupo').props.value).toBe('Descrição do grupo de teste');
    });
  });

  it('deve permitir editar o nome e a descrição do grupo', async () => {
    const { getByLabelText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    const nameInput = getByLabelText('Nome do Grupo');
    const descriptionInput = getByLabelText('Descrição do Grupo');
    fireEvent.changeText(nameInput, 'Novo Nome do Grupo');
    fireEvent.changeText(descriptionInput, 'Nova descrição do grupo');

    expect(nameInput.props.value).toBe('Novo Nome do Grupo');
    expect(descriptionInput.props.value).toBe('Nova descrição do grupo');
  });

  it('deve exibir erro quando o nome excede 20 caracteres', async () => {
    const { getByLabelText, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    fireEvent.changeText(
      getByLabelText('Nome do Grupo'),
      'Este é um nome muito longo que excede vinte caracteres',
    );
    fireEvent.press(getByText('Salvar alterações'));

    await waitFor(() => {
      expect(getByText('Máximo de 20 caracteres')).toBeTruthy();
    });
    expect(mockedApi.patch).not.toHaveBeenCalled();
  });

  it('deve exibir erro quando a descrição excede 500 caracteres', async () => {
    const { getByLabelText, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    fireEvent.changeText(getByLabelText('Descrição do Grupo'), 'a'.repeat(501));
    fireEvent.press(getByText('Salvar alterações'));

    await waitFor(() => {
      expect(getByText('Máximo de 500 caracteres')).toBeTruthy();
    });
    expect(mockedApi.patch).not.toHaveBeenCalled();
  });

  it('deve salvar as alterações do grupo da rota com aviso de sucesso', async () => {
    const { getByLabelText, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    fireEvent.changeText(getByLabelText('Nome do Grupo'), 'Grupo Editado');
    fireEvent.changeText(getByLabelText('Descrição do Grupo'), 'Descrição editada');
    fireEvent.press(getByText('Salvar alterações'));

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith('/group/mock-group-id', {
        name: 'Grupo Editado',
        description: 'Descrição editada',
      });
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text1: 'Grupo atualizado!' }),
      );
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('deve mostrar aviso de erro e permanecer na tela quando o salvamento falha', async () => {
    mockedApi.patch.mockRejectedValueOnce({
      response: { data: { message: 'Sem permissão para editar este grupo.' } },
    });

    const { getByLabelText, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByLabelText('Nome do Grupo').props.value).toBe('Grupo de Teste');
    });

    fireEvent.changeText(getByLabelText('Nome do Grupo'), 'Grupo Editado');
    fireEvent.press(getByText('Salvar alterações'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Erro ao salvar',
          text2: 'Sem permissão para editar este grupo.',
        }),
      );
    });
    expect(mockedGoBack).not.toHaveBeenCalled();
  });

  it('não deve carregar nem salvar quando a rota não informa o grupo', async () => {
    (global as any).mockEditGroupRoute.mockReturnValue({ params: {} });

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Não foi possível identificar o grupo que deve ser editado.')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(mockedApi.patch).not.toHaveBeenCalled();
  });

  it('não deve carregar dados do grupo quando não há usuário logado', async () => {
    mockLoggedId = undefined;

    renderScreen();

    await waitFor(() => {
      expect(mockedApi.get).not.toHaveBeenCalled();
    });
  });
});
