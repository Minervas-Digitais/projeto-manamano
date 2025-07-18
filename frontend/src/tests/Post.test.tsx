import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Post from '../pages/Post/Post';
import api from '../services/api';
import { useRoute } from '@react-navigation/native';

// mock das apis do expo q nao estao disponiveis em teste
jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(() => Promise.resolve('')),
    writeAsStringAsync: jest.fn(() => Promise.resolve()),
    deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-media-library', () => ({
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-intent-launcher', () => ({
    startActivityAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-font', () => ({
    useFonts: () => [true],
}));


jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(),
    };
});

(useRoute as jest.Mock).mockReturnValue({
    params: {
        postId: '123',
    },
});

jest.mock('../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn((url) => {
            if (url === 'post/123') {
                return Promise.resolve({
                    data: {
                        id: '123',
                        input: 'Texto do post',
                        userId: 'user1',
                        groupId: 'group1',
                        createdAt: new Date().toISOString(),
                        Comment: [
                            { id: 'c1', userId: 'user2', content: 'Comentário 1', createdAt: new Date().toISOString() },
                            { id: 'c2', userId: 'user3', content: 'Comentário 2', createdAt: new Date().toISOString() },
                        ],
                    },
                });
            }
            if (url === 'user/user1') {
                return Promise.resolve({ data: { fullName: 'Usuário Teste' } });
            }
            if (url === 'user/user2') {
                return Promise.resolve({ data: { fullName: 'Comentador 1' } });
            }
            if (url === 'user/user3') {
                return Promise.resolve({ data: { fullName: 'Comentador 2' } });
            }
            if (url.startsWith('group/')) {
                return Promise.resolve({ data: { name: 'Grupo Teste' } });
            }
            if (url.startsWith('archives/post/123')) {
                return Promise.resolve({
                    data: [
                        { id: 'a1', name: 'Arquivo 1', file: 'http://exemplo.com/a1.pdf' },
                        { id: 'a2', name: 'Arquivo 2', file: 'http://exemplo.com/a2.pdf' },
                    ],
                });
            }
            return Promise.resolve({ data: {} });
        }),
        post: jest.fn(),
    },
}));

jest.mock('../pages/SignIn/SignIn', () => ({
    storage: {
        getString: (key: string) => {
            if (key === 'accessToken') return 'fake-token';
            if (key === 'loggedId') return '123';
            return null;
        },
    },
}));


const Stack = createStackNavigator();
const renderWithNavigation = () =>
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Post" component={Post} />
            </Stack.Navigator>
        </NavigationContainer>
    );


(global as any).alert = jest.fn();

describe("About", () => {
    beforeAll(() => {
        //ignora os erros do act e causados pelo proprio teste
        jest.spyOn(console, 'error').mockImplementation((msg) => {
            if (typeof msg === 'string') {
                if (msg.includes('An update to') ||
                    msg.includes('inside a test was not wrapped in act')
                ) {
                    return;
                }
            }

            console.warn(msg);
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    })


    it('deve renderizar a pagina e mostrar os textos principais', async () => {
        const { getByText } = renderWithNavigation();
        await waitFor(() => {
            expect(getByText('Publicação')).toBeTruthy();
            expect(getByText('Texto do post')).toBeTruthy();
            expect(getByText('Comentador 1')).toBeTruthy();
            expect(getByText('Comentador 2')).toBeTruthy();
            expect(getByText('Comentário 1')).toBeTruthy();
            expect(getByText('Comentário 2')).toBeTruthy();
        });
    });

    it('deve enviar um comentário com sucesso', async () => {
        const { getByTestId, getByText } = renderWithNavigation();

        await waitFor(() => {
            expect(getByText('Texto do post')).toBeTruthy();
        });

        const inputContainer = getByTestId('input-container');
        fireEvent.press(inputContainer);

        const input = getByTestId('input-comentario');
        fireEvent.changeText(input, 'Meu comentário de teste');

        const enviarBtn = getByTestId('enviar-comentario');
        fireEvent.press(enviarBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/comment',
                expect.objectContaining({
                    content: 'Meu comentário de teste',
                }),
                expect.any(Object)
            );
        });
    });

    it('deve renderizar a página com arquivos (archives)', async () => {
        const { getByText } = renderWithNavigation();

        await waitFor(() => {
            expect(getByText('Publicação')).toBeTruthy();
            expect(getByText('Texto do post')).toBeTruthy();

            expect(getByText('Arquivo 1')).toBeTruthy();
            expect(getByText('Arquivo 2')).toBeTruthy();
        });
    });
})