import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigNotification from '../pages/ConfigNotification/ConfigNotification';

jest.mock('expo-font', () => ({
    useFonts: () => [true],
}));

const Stack = createStackNavigator();
const renderWithNavigation = () =>
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="ConfigNotification" component={ConfigNotification} />
            </Stack.Navigator>
        </NavigationContainer>
    );

(global as any).alert = jest.fn();

describe("ConfigNotification", () => {
    const testButtons = [
        'Desabilitar-notificação-pop-up',
        'Silenciar-notificação-do-Sistema',
        'Silenciar-notificação-dos-grupos',
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('deve renderizar a pagina e mostrar os textos principais', async () => {
        const { getByText } = renderWithNavigation();

        await waitFor(() => {
            expect(getByText('Notificações')).toBeTruthy();
            expect(getByText('Desabilitar notificação pop-up')).toBeTruthy();
            expect(getByText('Silenciar notificação do Sistema')).toBeTruthy();
            expect(getByText('Silenciar notificação dos grupos')).toBeTruthy();
        });
    });

    test.each(testButtons)('deve alternar os ícones SVG ao clicar no botão %s', async (idSuffix) => {
        const { getByTestId, queryByTestId } = renderWithNavigation();
        const toggleButton = await waitFor(() => getByTestId(`toggle-${idSuffix}`));

        expect(getByTestId(`EllipseB-${idSuffix}`)).toBeTruthy();
        expect(getByTestId(`Rect-${idSuffix}`)).toBeTruthy();
        expect(queryByTestId(`EllipseW-${idSuffix}`)).toBeNull();
        expect(queryByTestId(`RectActv-${idSuffix}`)).toBeNull();

        fireEvent.press(toggleButton);

        await waitFor(() => {
            expect(getByTestId(`EllipseW-${idSuffix}`)).toBeTruthy();
            expect(getByTestId(`RectActv-${idSuffix}`)).toBeTruthy();
            expect(queryByTestId(`EllipseB-${idSuffix}`)).toBeNull();
            expect(queryByTestId(`Rect-${idSuffix}`)).toBeNull();
        });
    });




})
