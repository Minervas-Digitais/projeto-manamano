import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NavigationContainer } from '@react-navigation/native';
import EditProfile from '../pages/EditProfile/EditProfile';
import api from '../services/api';
import storage from '../services/secureStorage';

// MOCKS

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

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('../components/BigInputText/BigInputText', () =>
  jest.fn(({ label, value, onChangeText, ...rest }) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        accessibilityLabel={label}
        {...rest}
      />
    );
  }),
);

jest.mock('../components/InputText/InputTextCustom', () =>
  jest.fn(({ label, value, onChangeText, type, innerRef, ...rest }) => {
    const { TextInput } = require('react-native');
    const props = {
      value,
      onChangeText,
      placeholder: label,
      accessibilityLabel: label,
      ...rest,
    };

    if (type === 'cel-phone' && innerRef) {
      const ref = { getRawValue: () => value.replace(/\D/g, '') };
      innerRef(ref);
    }

    return <TextInput {...props} />;
  }),
);

jest.mock('../components/DropdownButton/DropdownCustom', () =>
  jest.fn(({ label, value, onChange }) => {
    const { Button } = require('react-native');
    return <Button title={`${label}: ${value}`} onPress={() => onChange('mock-selection')} />;
  }),
);

jest.mock('../components/SideMenu/SideMenu', () => 'SideMenu');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as any;
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

const renderWithNavigation = (component: React.ReactElement) =>
  render(<NavigationContainer>{component}</NavigationContainer>);

describe('EditProfile', () => {
  const mockUserData = {
    fullName: 'Nome Teste',
    phone: '(11) 98765-4321',
    email: 'teste@example.com',
    birthday: '1995-10-20',
    ethnicity: 'Parda',
    expertise: 'Tecnologia',
    neighborhood: 'Centro',
    bio: 'Desenvolvedora React Native.',
    enterprise: 'Tech Corp',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy.mockClear();

    mockedStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'accessToken') return 'mock-token';
      if (key === 'loggedId') return 'mock-user-id';
      return null;
    });

    mockedApi.get.mockImplementation(async (url: string) => {
      if (url === '/user/mock-user-id/profile-picture') {
        return { data: 'mock-binary-image' } as any;
      }

      if (url === '/user/mock-user-id') {
        return { data: mockUserData } as any;
      }

      return { data: {} } as any;
    });
    mockedApi.patch.mockResolvedValue({ data: { message: 'Success' } });

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      assets: [
        {
          uri: 'file://mocked-path/profile.jpg',
          name: 'profile.jpg',
          mimeType: 'image/jpeg',
        },
      ],
      canceled: false,
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('Deve renderizar corretamente com os dados na tela', async () => {
    const { getByLabelText } = renderWithNavigation(<EditProfile />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/user/mock-user-id', {
        headers: { Authorization: 'Bearer mock-token' },
      });
    });

    expect(getByLabelText('Nome').props.value).toBe('Nome Teste');
    expect(getByLabelText('Telefone').props.value).toBe('(11) 98765-4321');
    expect(getByLabelText('Data de Nascimento').props.value).toBe('19/10/1995');
    expect(getByLabelText('E-mail').props.value).toBe('teste@example.com');
    expect(getByLabelText('Bio').props.value).toBe('Desenvolvedora React Native.');
    expect(getByLabelText('Empreendimento').props.value).toBe('Tech Corp');
  });

  it('Deve mostrar erros de validação para campos obrigatórios no submit', async () => {
    const { getByText, getByLabelText } = renderWithNavigation(<EditProfile />);

    await waitFor(() => expect(getByLabelText('Nome').props.value).toBe(mockUserData.fullName));

    fireEvent.changeText(getByLabelText('Nome'), '');
    fireEvent.changeText(getByLabelText('E-mail'), 'email-invalido');

    fireEvent.press(getByLabelText('Salvar'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Erros:'));
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Campo obrigatório'));
      expect(getByText('Campo obrigatório')).toBeTruthy();
    });

    expect(api.patch).not.toHaveBeenCalled();
  });

  it('Deve mostrar a validação por padrão no nome caso tenha caracteres inválidos', async () => {
    const { getByText, getByLabelText } = renderWithNavigation(<EditProfile />);

    await waitFor(() => expect(getByLabelText('Nome').props.value).toBe(mockUserData.fullName));

    fireEvent.changeText(getByLabelText('Nome'), 'Teste 123');
    fireEvent.press(getByLabelText('Salvar'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Erros:'));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Apenas letras são permitidas'),
      );
      expect(getByText('Apenas letras são permitidas')).toBeTruthy();
    });

    expect(api.patch).not.toHaveBeenCalled();
  });

  it('Deve submitar os novos dados corretamente ao salvar', async () => {
    const { getByText, getByLabelText } = renderWithNavigation(<EditProfile />);

    await waitFor(() => expect(getByLabelText('Nome').props.value).toBe(mockUserData.fullName));

    const novoNome = 'Novo Nome Teste';
    fireEvent.changeText(getByLabelText('Nome'), novoNome);

    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledTimes(1);

      expect(api.patch).toHaveBeenCalledWith(
        '/user',
        expect.objectContaining({
          fullName: novoNome,
          birthday: new Date('1995-10-19').toISOString(),
        }),
        {
          headers: { Authorization: 'Bearer mock-token' },
        },
      );
    });

    expect(alertSpy).toHaveBeenCalledWith('Changes saved successfully!');
  });

  it('Deve lidar com os erros da API ao submitar e mostrar um alerta', async () => {
    const mensagemErro = 'Erro na API';
    mockedApi.patch.mockRejectedValueOnce({
      response: { data: { message: mensagemErro } },
    });

    const { getByText, getByLabelText } = renderWithNavigation(<EditProfile />);

    await waitFor(() => expect(getByLabelText('Nome').props.value).toBe(mockUserData.fullName));

    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledWith(`Failed to save data: ${mensagemErro}`);
  });

  it('Deve permitir alterar a imagem de perfil', async () => {
    const { getByTestId } = renderWithNavigation(<EditProfile />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/user/mock-user-id', expect.any(Object));
      expect(mockedApi.get).toHaveBeenCalledWith(
        '/user/mock-user-id/profile-picture',
        expect.any(Object),
      );
    });

    const imageEditButton = getByTestId('edit-profile-picture-button');
    fireEvent.press(imageEditButton);

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();

      expect(mockedApi.patch).toHaveBeenCalledWith('/user/profile-picture', expect.any(FormData), {
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });
});
