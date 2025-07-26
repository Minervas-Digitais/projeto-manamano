import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NewLesson from '../pages/NewLesson/NewLesson';
import api from '../services/api';
import Toast from 'react-native-toast-message';


// Mock fonts
jest.mock('expo-font', () => ({
    useFonts: () => [true],
}));

// Mock document picker
jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn().mockResolvedValue({
        type: 'success',
        assets: [
            {
                name: 'arquivo.pdf',
                uri: 'file://mocked/path/arquivo.pdf',
                mimeType: 'application/pdf',
            },
        ],
    }),
}));
// Mock SVGs importados como componentes React vazios
jest.mock('../../assets/arrow-icon.svg', () => {
    const React = require('react');
    return () => null;
});
jest.mock('../../assets/input-link-icon.svg', () => {
    const React = require('react');
    return () => null;
});
jest.mock('../../assets/calendar-icon.svg', () => {
    const React = require('react');
    return () => null;
});

// Mock do react-navigation

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({ params: { groupId: '123' } }),
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: mockGoBack,
        }),
    };
});

jest.mock('../pages/SignIn/SignIn', () => ({
    storage: {
        getString: jest.fn((key) => {
            if (key === 'accessToken') return 'fake-token';
            if (key === 'loggedId') return 'fake-user-id';
            return null;
        }),
    },
}));

// Mock api
jest.mock('../services/api', () => {
    const post = jest.fn((url, data) => {
        return Promise.resolve({ data: { success: true } });
    });

    const get = jest.fn((url) => {
        if (url === 'category/group/123') {
            return Promise.resolve({ data: [{ id: '1', name: 'Aulas' }] });
        }
        return Promise.resolve({ data: [] });
    });

    return {
        __esModule: true,
        default: {
            post,
            get,
        },
    };
});

// Mock Toast
jest.mock('react-native-toast-message', () => {
    const React = require('react');
    const { View } = require('react-native');
    const show = jest.fn();
    const hide = jest.fn();

    const ToastComponent = (props: any) => <View {...props} />;
    ToastComponent.show = show;
    ToastComponent.hide = hide;

    return {
        __esModule: true,
        default: ToastComponent,
        show,
        hide,
    };
});

const Stack = createStackNavigator();
const renderWithNavigation = () =>
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="NewLesson" component={NewLesson} />
            </Stack.Navigator>
            <Toast />
        </NavigationContainer>
    );


(global as any).alert = jest.fn();

describe('NewLesson', () => {
    beforeAll(() => {
        // ignora os erros do act e causados pelo proprio teste
        jest.spyOn(console, 'error').mockImplementation((msg) => {
            if (typeof msg === 'string') {
                if (
                    msg.includes('An update to') ||
                    msg.includes('inside a test was not wrapped in act')
                ) {
                    return;
                }
            }

            console.warn(msg);
        });
    })

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza corretamente o componente com os campos principais', async () => {
        const { getByTestId, queryByTestId } = renderWithNavigation();

        await waitFor(() => {
            expect(getByTestId('input-title')).toBeTruthy();
            expect(getByTestId('input-date')).toBeTruthy();
            expect(getByTestId('input-hour')).toBeTruthy();
            expect(getByTestId('input-link')).toBeTruthy();
            expect(getByTestId('input-vod')).toBeTruthy();
            expect(getByTestId('input-description')).toBeTruthy();
            expect(getByTestId('btn-add-file')).toBeTruthy();
            expect(getByTestId('btn-publish')).toBeTruthy();
        });

        expect(queryByTestId('error-title')).toBeNull();
    });

    it('deve mostrar erros ao tentar enviar formulário vazio', async () => {
        const { getByTestId, findAllByText } = renderWithNavigation();

        fireEvent.press(getByTestId('btn-publish'));
        const errors = await findAllByText('Campo obrigatório');
        expect(errors.length).toBeGreaterThan(0);
    });

    it('deve chamar picker ao clicar em adicionar arquivo', async () => {
        const DocumentPicker = require('expo-document-picker');
        DocumentPicker.getDocumentAsync.mockResolvedValue({
            assets: [
                { name: 'arquivo.pdf', uri: 'file://arquivo.pdf', mimeType: 'application/pdf' },
            ],
        });

        const { getByTestId, findByTestId } = renderWithNavigation()

        fireEvent.press(getByTestId('btn-add-file'));

        expect(await findByTestId(/file-item-/)).toBeTruthy();
    });

    it('envia o formulário corretamente com dados válidos', async () => {
        const { getByTestId, findByTestId } = renderWithNavigation();

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                'category/group/123',
                expect.anything()
            );

        });

        fireEvent.changeText(getByTestId('input-title'), 'Aula Teste');
        fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
        fireEvent.changeText(getByTestId('input-hour'), '23:59');
        fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
        fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
        fireEvent.changeText(getByTestId('input-description'), 'Descrição da aula de teste.');

        fireEvent.press(getByTestId('btn-add-file'));
        const fileItem = await findByTestId(/file-item-/);
        expect(fileItem).toBeTruthy();

        fireEvent.press(getByTestId('btn-publish'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
        });
    });

    it('remove um arquivo ao clicar no card', async () => {
        const { getByTestId, findByTestId, queryByTestId } = renderWithNavigation();

        fireEvent.press(getByTestId('btn-add-file'));
        const fileItem = await findByTestId(/file-item-/);
        expect(fileItem).toBeTruthy();

        fireEvent.press(fileItem);
        await waitFor(() => {
            expect(queryByTestId(/file-item-/)).toBeNull();
        });
    });

    it('mostra erro ao falhar na seleção de arquivos', async () => {
        const DocumentPicker = require('expo-document-picker');
        DocumentPicker.getDocumentAsync.mockRejectedValueOnce(new Error('Falha ao selecionar'));

        const { getByTestId } = renderWithNavigation();

        fireEvent.press(getByTestId('btn-add-file'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    text1: 'Erro ao selecionar os arquivos.',
                })
            );
        });
    });

    it('mostra erro ao não selecionar nenhum arquivo', async () => {
        const DocumentPicker = require('expo-document-picker');
        DocumentPicker.getDocumentAsync.mockResolvedValueOnce({ assets: [] });

        const { getByTestId } = renderWithNavigation();

        fireEvent.press(getByTestId('btn-add-file'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    text1: 'Nenhum arquivo selecionado.',
                })
            );
        });
    });

    it('mostra erro se categoria "Aulas" não for encontrada', async () => {
        const apiMock = require('../services/api').default;
        apiMock.get.mockResolvedValueOnce({ data: [{ id: '1', name: 'Outros' }] });

        const { getByTestId } = renderWithNavigation();

        fireEvent.changeText(getByTestId('input-title'), 'Aula sem categoria Aulas');
        fireEvent.changeText(getByTestId('input-date'), '31/12/2099');
        fireEvent.changeText(getByTestId('input-hour'), '23:59');
        fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
        fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
        fireEvent.changeText(getByTestId('input-description'), 'Descrição');

        fireEvent.press(getByTestId('btn-publish'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    text1: 'Categoria "Aulas" não encontrada.',
                })
            );
        });
    });

    it('valida que data não pode ser no passado', async () => {
        const { getByTestId, findByText } = renderWithNavigation();

        fireEvent.changeText(getByTestId('input-date'), '01/01/2000');
        fireEvent.changeText(getByTestId('input-hour'), '12:00');
        fireEvent.press(getByTestId('btn-publish'));

        expect(await findByText('Data inválida')).toBeTruthy();
    });

    it('valida que horário não pode estar no passado no mesmo dia', async () => {
        const { getByTestId, findByText } = renderWithNavigation();

        const today = new Date();
        const todayStr = today.toLocaleDateString('pt-BR');

        fireEvent.changeText(getByTestId('input-date'), todayStr);
        fireEvent.changeText(getByTestId('input-hour'), '00:01');

        fireEvent.press(getByTestId('btn-publish'));

        expect(await findByText('Esta hora já passou')).toBeTruthy();
    });

    it('mostra erro se API falhar ao criar aula', async () => {
        const apiMock = require('../services/api').default;
        apiMock.post.mockRejectedValueOnce(new Error('Erro na API'));

        const { getByTestId } = renderWithNavigation();

        fireEvent.changeText(getByTestId('input-title'), 'Aula Teste');
        fireEvent.changeText(getByTestId('input-date'), '31/12/2025');
        fireEvent.changeText(getByTestId('input-hour'), '23:59');
        fireEvent.changeText(getByTestId('input-link'), 'https://live.com/aula');
        fireEvent.changeText(getByTestId('input-vod'), 'https://vod.com/aula');
        fireEvent.changeText(getByTestId('input-description'), 'Descrição da aula de teste.');

        fireEvent.press(getByTestId('btn-publish'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'error' })
            );
        });
    });
});
