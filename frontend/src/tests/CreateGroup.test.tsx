import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import CreateGroup from '../pages/CreateGroup/CreateGroup';
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';

// MOCKS
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('CreateGroup Page', () => {
  const mockStorage = storage as jest.Mocked<typeof storage>;
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getString.mockImplementation((key: string) => {
      if (key === 'accessToken') return 'fake-access-token';
      if (key === 'loggedId') return 'user-123';
      return undefined;
    });
  });

  it('should render CreateGroup page correctly', () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    expect(getByText('Criar Grupo')).toBeTruthy();
    expect(getByText('Nome do Grupo')).toBeTruthy();
    expect(getByText('Descrição do Grupo')).toBeTruthy();
    expect(getByText('Categorias')).toBeTruthy();
    expect(getByText('Criar')).toBeTruthy();
    expect(getByTestId('group-name-input')).toBeTruthy();
    expect(getByTestId('group-description-input')).toBeTruthy();
    expect(getByTestId('category-input')).toBeTruthy();
    expect(getByTestId('add-category-button')).toBeTruthy();
    expect(getByTestId('create-group-button')).toBeTruthy();
  });

  it('should render default categories correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    expect(getByText('Geral')).toBeTruthy();
    expect(getByText('Aulas')).toBeTruthy();
    expect(getByText('Eventos')).toBeTruthy();
  });

  it('should add a new category when typing and pressing Enter', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );
    const categoryInput = getByTestId('category-input');
    fireEvent.changeText(categoryInput, 'Nova Categoria');
    fireEvent(categoryInput, 'onKeyPress', { nativeEvent: { key: 'Enter' } });

    expect(getByTestId('category-Nova Categoria')).toBeTruthy();
  });

  it('should add a new category when clicking the + button', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const categoryInput = getByTestId('category-input');
    const addButton = getByTestId('add-category-button');

    fireEvent.changeText(categoryInput, 'Categoria Teste');
    fireEvent.press(addButton);

    expect(getByTestId('category-Categoria Teste')).toBeTruthy();
  });

  it('should not add duplicate categories', () => {
    const { getByTestId, getAllByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const categoryInput = getByTestId('category-input');
    const addButton = getByTestId('add-category-button');

    fireEvent.changeText(categoryInput, 'Duplicada');
    fireEvent.press(addButton);
    fireEvent.changeText(categoryInput, 'Duplicada');
    fireEvent.press(addButton);

    try {
      const duplicatedCategories = getAllByTestId('category-Duplicada');
      expect(duplicatedCategories).toHaveLength(1);
    } catch {
      expect(getByTestId('category-Duplicada')).toBeTruthy();
    }
  });

  it('should not add empty categories', () => {
    const { getByTestId, queryByText } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const categoryInput = getByTestId('category-input');
    const addButton = getByTestId('add-category-button');

    fireEvent.changeText(categoryInput, '   ');
    fireEvent.press(addButton);

    expect(queryByText('   ')).toBeNull();
  });

  it('should remove a category when clicking the - button', () => {
    const { getByTestId, queryByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const categoryInput = getByTestId('category-input');
    const addButton = getByTestId('add-category-button');

    // Add a category first
    fireEvent.changeText(categoryInput, 'Categoria Remover');
    fireEvent.press(addButton);

    // Verify the category was added
    expect(getByTestId('category-Categoria Remover')).toBeTruthy();

    // Remove the category
    const removeButton = getByTestId('category-Categoria Remover');
    fireEvent.press(removeButton);

    // Verify the category was removed
    expect(queryByTestId('category-Categoria Remover')).toBeNull();
  });

  it('should show error when trying to create group without name', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const descriptionInput = getByTestId('group-description-input');
    fireEvent.changeText(descriptionInput, 'Descrição válida');

    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Preencha corretamente os campos.');
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('should show error when trying to create group without description', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    fireEvent.changeText(nameInput, 'Nome válido');

    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Preencha corretamente os campos.');
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('should show error when access token is missing', async () => {
    mockStorage.getString.mockImplementation((key: string) => {
      if (key === 'loggedId') return 'user-123';
      return undefined; // No access token
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');

    fireEvent.changeText(nameInput, 'Nome do Grupo');
    fireEvent.changeText(descriptionInput, 'Descrição do grupo');
    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Access token is missing.');
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('should create group successfully and navigate to Home', async () => {
    mockApi.post
      .mockResolvedValueOnce({
        data: {
          id: 'group-123',
          inviteCode: 'INVITE123',
        },
      })
      .mockResolvedValue({ data: {} });

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');

    fireEvent.changeText(nameInput, 'Meu Grupo Teste');
    fireEvent.changeText(descriptionInput, 'Descrição do meu grupo de teste');
    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/group',
        {
          name: 'Meu Grupo Teste',
          description: 'Descrição do meu grupo de teste',
        },
        {
          headers: {
            Authorization: 'Bearer fake-access-token',
          },
        },
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Successo',
        'Grupo criado com sucesso! ID: group-123',
      );
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  it('should create group with custom categories', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 'group-123', inviteCode: 'INVITE123' } });

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');
    const categoryInput = getByTestId('category-input');
    const addButton = getByTestId('add-category-button');

    fireEvent.changeText(nameInput, 'Grupo com Categorias');
    fireEvent.changeText(descriptionInput, 'Descrição do grupo');

    fireEvent.changeText(categoryInput, 'Categoria Custom 1');
    fireEvent.press(addButton);
    fireEvent.changeText(categoryInput, 'Categoria Custom 2');
    fireEvent.press(addButton);

    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      // Verify multiple API calls were made:
      // group + 4 default categories + 2 custom categories + participant = 8 total
      expect(mockApi.post).toHaveBeenCalledTimes(8);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  it('should handle API error during group creation', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');

    fireEvent.changeText(nameInput, 'Grupo com Erro');
    fireEvent.changeText(descriptionInput, 'Descrição do grupo');
    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Falha ao criar grupo ou categoria');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle error when adding participant fails', async () => {
    mockApi.post
      .mockResolvedValueOnce({
        data: {
          id: 'group-123',
          inviteCode: 'INVITE123',
        },
      }) // Group creation
      .mockResolvedValueOnce({ data: {} }) // Category 1: Geral
      .mockResolvedValueOnce({ data: {} }) // Category 2: Avisos
      .mockResolvedValueOnce({ data: {} }) // Category 3: Eventos
      .mockResolvedValueOnce({ data: {} }) // Category 4: Aulas
      .mockRejectedValueOnce({ response: { status: 400 } });

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');

    fireEvent.changeText(nameInput, 'Grupo Teste');
    fireEvent.changeText(descriptionInput, 'Descrição teste');
    fireEvent.press(getByTestId('create-group-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Successo',
        'Grupo criado com sucesso! ID: group-123',
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Falha ao adicionar usuário como moderador',
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle unknown error when adding participant fails', async () => {
    // Setup mocks: group creation succeeds, each category succeeds, participant fails
    mockApi.post
      .mockResolvedValueOnce({
        data: {
          id: 'group-123',
          inviteCode: 'INVITE123',
        },
      }) // Group creation
      .mockResolvedValueOnce({ data: {} }) // Category 1: Geral
      .mockResolvedValueOnce({ data: {} }) // Category 2: Avisos
      .mockResolvedValueOnce({ data: {} }) // Category 3: Eventos
      .mockResolvedValueOnce({ data: {} }) // Category 4: Aulas
      .mockRejectedValueOnce(new Error('Falha desconhecida')); // Participant creation fails

    const { getByTestId } = render(
      <NavigationContainer>
        <CreateGroup />
      </NavigationContainer>,
    );

    const nameInput = getByTestId('group-name-input');
    const descriptionInput = getByTestId('group-description-input');

    fireEvent.changeText(nameInput, 'Grupo Teste');
    fireEvent.changeText(descriptionInput, 'Descrição teste');
    fireEvent.press(getByTestId('create-group-button'));

    // First, success alert should be called when group is created
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Successo',
        'Grupo criado com sucesso! ID: group-123',
      );
    });

    // Then, error alert should be called when participant fails
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Falha desconhecida');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
