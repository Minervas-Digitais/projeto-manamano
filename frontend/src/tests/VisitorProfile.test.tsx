import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import VisitorProfile from '../pages/VisitorProfile/VisitorProfile';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

jest.mock('../components/SideMenu/SideMenu', () => (props: any) => {
  const { View } = require('react-native');
  return <View testID="mock-sidemenu" {...props} />;
});

jest.mock('../components/PostCard/PostCard', () => (props: any) => {
  const { View } = require('react-native');
  return <View testID="mock-postcard" {...props} />;
});

const mockNavigation = {
  navigate: jest.fn(),
};

describe('VisitorProfile', () => {
  const useFontsMock = require('expo-font').useFonts as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useFontsMock.mockReturnValue([true]);
  });

  it('Nao deve renderizar se as fontes nao carregaram', () => {
    useFontsMock.mockReturnValue([false]);

    // deve retornar undefined
    const { toJSON } = render(<VisitorProfile navigation={{ navigate: mockNavigation }} />);

    // o snapshot de undefined em toJSON deve ser Null
    expect(toJSON()).toBeNull();
  });

  it('Deve renderizar a pagina corretamente', () => {
    const { getByText, getAllByTestId } = render(
      <VisitorProfile navigation={{ navigate: mockNavigation }} />,
    );

    expect(getByText('Maria Fernanda')).toBeTruthy();
    expect(getByText('Rio de Janeiro')).toBeTruthy();
    expect(getByText('Doceria da Maria')).toBeTruthy();

    expect(getByText(/Lorem ipsum dolor sit amet/i)).toBeTruthy();

    const posts = getAllByTestId('mock-postcard');
    expect(posts.length).toBe(6);
  });

  it('Deve abrir/fechar o menu lateral ao apertar o botao', () => {
    const { getByTestId, getAllByRole } = render(
      <VisitorProfile navigation={{ navigate: mockNavigation }} />,
    );

    const sideMenuComponente = getByTestId('mock-sidemenu');

    // o menu lateral tem que ta ativo
    expect(sideMenuComponente.props.display).toBe(true);

    // o primeiro botao (touchable opacity) eh o do menu lateral
    // pega pelo accessibilityRole do componente
    const menuButton = getAllByRole('button')[0];

    // testa o toggle

    fireEvent.press(menuButton);
    expect(sideMenuComponente.props.display).toBe(false);

    fireEvent.press(menuButton);
    expect(sideMenuComponente.props.display).toBe(true);
  });
});
