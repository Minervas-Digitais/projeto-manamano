import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import About from '../pages/About/About';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

const Stack = createStackNavigator();
const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="About" component={About} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

(global as any).alert = jest.fn();

describe('About', () => {
  beforeAll(() => {
    // ignora os erros do act e causados pelo proprio teste
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('An update to') || msg.includes('inside a test was not wrapped in act')) {
          return;
        }
      }

      console.warn(msg);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a pagina e mostrar os textos principais', () => {
    const { getByText } = renderWithNavigation();

    expect(getByText('ManaMano')).toBeTruthy();
    expect(getByText(/MANAMANO contribui para/)).toBeTruthy();
    expect(getByText('Quem fez o App')).toBeTruthy();

    expect(getByText('Rayane Domingos')).toBeTruthy();
    expect(getByText('Pedro Mateus')).toBeTruthy();
    expect(getByText('Mellanie Pereira')).toBeTruthy();
    expect(getByText('Nicolas Bastos')).toBeTruthy();
  });
});
