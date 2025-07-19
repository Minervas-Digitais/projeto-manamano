import React from 'react';
import { storage } from '../pages/SignIn/SignIn';
import api from '../services/api';
import EditProfile from '../pages/EditProfile/EditProfile';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// MOCKS

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock("../services/api");

jest.mock('../pages/SignIn/SignIn', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

// Mockando os componentes
jest.mock('../components/BigInputText/BigInputText', () =>
    jest.fn(({ label, value, onChangeText, ...rest }) => {
        const { TextInput } = require('react-native');
        return <TextInput value={value} onChangeText={onChangeText} placeholder={label} accessibilityLabel={label} {...rest} />;
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
            // Mocka a referencia para validação do telefone
            const ref = { getRawValue: () => value.replace(/\D/g, '') };
            innerRef(ref);
        }
        return <TextInput {...props} />;
    }),
);

jest.mock('../components/DropdownButton/DropdownCustom', () =>
    jest.fn(({ label, value, onChange }) => {
        const { Button } = require('react-native');
        // Simula um item existente
        return <Button title={`${label}: ${value}`} onPress={() => onChange('mock-selection')} />;
    }),
);

jest.mock('../components/SideMenu/SideMenu', () => 'SideMenu');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as jest.Mocked<typeof storage>;
(global as any).alert = jest.fn();

describe("EditProfile", () => {
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


        mockedStorage.getString.mockImplementation((key: string) => {
            if (key === 'accessToken') return 'mock-token';
            if (key === 'loggedId') return 'mock-user-id';
            return undefined;
        });

        mockedApi.get.mockResolvedValue({ data: mockUserData });
        mockedApi.patch.mockResolvedValue({ data: { message: 'Success' } });
    });

    it("Deve renderizar corretamente com os dados na tela", async () => {
        const { getByLabelText } = render(<EditProfile />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith("/user/mock-user-id", {
                headers: { Authorization: "Bearer mock-token"},
            });
        });

        expect(getByLabelText('Nome').props.value).toBe('Nome Teste');
        expect(getByLabelText('Telefone').props.value).toBe('(11) 98765-4321');
        // Data formatada e ajustada para a conversao de UTC para UTC-3
        expect(getByLabelText('Data de Nascimento').props.value).toBe('19/10/1995');
        expect(getByLabelText('E-mail').props.value).toBe('teste@example.com');
        expect(getByLabelText('Bio').props.value).toBe('Desenvolvedora React Native.');
        expect(getByLabelText('Empreendimento').props.value).toBe('Tech Corp');
    });

    it("Deve mostrar erros de validação para campos obrigatórios no submit", async () => {
        const { getByText, getByLabelText } = render(<EditProfile />);

        // Espera os dados iniciais carregarem
        await waitFor(() => expect(getByLabelText("Nome").props.value).toBe(mockUserData.fullName));

        fireEvent.changeText(getByLabelText("Nome"), "");
        fireEvent.changeText(getByLabelText("E-mail"), "email-invalido");

        fireEvent.press(getByLabelText("Salvar"));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledTimes(1);
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Erros:"));
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Campo obrigatório"));
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Endereço de e-mail inválido"));
            expect(getByText("Campo obrigatório")).toBeTruthy();
            expect(getByText("Endereço de e-mail inválido")).toBeTruthy();
        });

        expect(api.patch).not.toHaveBeenCalled();
    });

    it("Deve mostrar a validação por padrão no nome caso tenha caracteres inválidos", async () => {
        const { getByText, getByLabelText } = render(<EditProfile />);

        // Espera os dados iniciais carregarem
        await waitFor(() => expect(getByLabelText("Nome").props.value).toBe(mockUserData.fullName));

        fireEvent.changeText(getByLabelText("Nome"), "Teste 123");
        fireEvent.press(getByLabelText("Salvar"));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledTimes(1);
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Erros:"));
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Apenas letras são permitidas"));
            expect(getByText("Apenas letras são permitidas")).toBeTruthy();
        });

        expect(api.patch).not.toHaveBeenCalled();
    });

    it("Deve submitar os novos dados corretamente ao salvar", async () => {
        const { getByText, getByLabelText } = render(<EditProfile />);

        // Espera os dados iniciais carregarem
        await waitFor(() => expect(getByLabelText("Nome").props.value).toBe(mockUserData.fullName));

        const novoNome = "Novo Nome Teste";
        fireEvent.changeText(getByLabelText("Nome"), novoNome);

        fireEvent.press(getByText("Salvar"));

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledTimes(1);

            expect(api.patch).toHaveBeenCalledWith(
                "/user/mock-user-id",
                expect.objectContaining({
                    fullName: novoNome,
                    birthday: new Date("1995-10-19").toISOString(),
                }),
                {
                    headers: { Authorization: "Bearer mock-token" },
                },
            );
        });

        expect(global.alert).toHaveBeenCalledWith("Changes saved successfully!")
    });

    it("Deve lidar com os erros da API ao submitar e mostrar um alerta", async () => {
        const mensagemErro = "Erro na API";
        mockedApi.patch.mockRejectedValueOnce({
            response: { data: { message: mensagemErro } }
        });

        const { getByText, getByLabelText } = render(<EditProfile />);

        // Espera os dados iniciais carregarem
        await waitFor(() => expect(getByLabelText("Nome").props.value).toBe(mockUserData.fullName));

        fireEvent.press(getByText("Salvar"));

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalled();
        });

        expect(global.alert).toHaveBeenCalledWith("Failed to save data: " + mensagemErro);
    });
})