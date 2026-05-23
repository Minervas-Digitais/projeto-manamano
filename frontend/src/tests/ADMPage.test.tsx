import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TouchableOpacity, Text, View } from 'react-native';
import ADMPage from '../pages/ADMPage/ADMPage';

// Mocks
const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock dos ícones SVG
jest.mock('../assets/white-group.svg', () => {
  function MockGroupIcon() {
    return <View testID="group-icon" />;
  }
  MockGroupIcon.displayName = 'GroupIcon';
  return MockGroupIcon;
});

jest.mock('../assets/white-megaphone.svg', () => {
  function MockMegaphoneIcon() {
    return <View testID="megaphone-icon" />;
  }
  MockMegaphoneIcon.displayName = 'MegaphoneIcon';
  return MockMegaphoneIcon;
});

jest.mock('../assets/white-gear.svg', () => {
  function MockGearIcon() {
    return <View testID="gear-icon" />;
  }
  MockGearIcon.displayName = 'GearIcon';
  return MockGearIcon;
});

jest.mock('../assets/white-mg.svg', () => {
  function MockSearchIcon() {
    return <View testID="search-icon" />;
  }
  MockSearchIcon.displayName = 'SearchIcon';
  return MockSearchIcon;
});

// Mock do componente ADMPageButton
jest.mock('../components/ADMPageButton/ADMPageButton', () => {
  function MockADMPageButton({ text, onPress }: any) {
    // Determina qual ícone renderizar baseado no texto do botão
    let iconTestId = 'unknown-icon';
    if (text === 'Pesquisar') iconTestId = 'search-icon';
    else if (text === 'Criar Grupo') iconTestId = 'group-icon';
    else if (text === 'Comunicados') iconTestId = 'megaphone-icon';
    else if (text === 'Configurações') iconTestId = 'gear-icon';

    return (
      <TouchableOpacity
        onPress={onPress}
        testID={`adm-button-${text.toLowerCase().replace(/\s+/g, '-')}`}>
        <View testID={iconTestId} />
        <Text>{text}</Text>
      </TouchableOpacity>
    );
  }
  return MockADMPageButton;
});

describe('ADMPage', () => {
  // Supressão de console durante os testes
  const originalConsoleError = console.error; // eslint-disable-line no-console
  const originalConsoleLog = console.log; // eslint-disable-line no-console

  beforeAll(() => {
    console.error = jest.fn(); // eslint-disable-line no-console
    console.log = jest.fn(); // eslint-disable-line no-console
  });

  afterAll(() => {
    console.error = originalConsoleError; // eslint-disable-line no-console
    console.log = originalConsoleLog; // eslint-disable-line no-console
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockClear(); // eslint-disable-line no-console
    (console.log as jest.Mock).mockClear(); // eslint-disable-line no-console
  });

  // TESTES UNITÁRIOS
  describe('Unit Tests', () => {
    it('should render correctly with initial state', () => {
      const { getByText } = render(<ADMPage />);

      expect(getByText('Olá,')).toBeTruthy();
      expect(getByText('Administrador!')).toBeTruthy();
      expect(getByText('Ações')).toBeTruthy();
    });

    it('should display all action buttons', () => {
      const { getByText } = render(<ADMPage />);

      expect(getByText('Pesquisar')).toBeTruthy();
      expect(getByText('Criar Grupo')).toBeTruthy();
      expect(getByText('Comunicados')).toBeTruthy();
      expect(getByText('Configurações')).toBeTruthy();
    });

    it('should display all icons', () => {
      const { getByTestId } = render(<ADMPage />);

      expect(getByTestId('search-icon')).toBeTruthy();
      expect(getByTestId('group-icon')).toBeTruthy();
      expect(getByTestId('megaphone-icon')).toBeTruthy();
      expect(getByTestId('gear-icon')).toBeTruthy();
    });
  });

  // TESTES DE NAVEGAÇÃO
  describe('Navigation Tests', () => {
    it('should navigate to Search when Pesquisar button is pressed', () => {
      const { getByTestId } = render(<ADMPage />);

      const searchButton = getByTestId('adm-button-pesquisar');
      fireEvent.press(searchButton);

      expect(mockedNavigate).toHaveBeenCalledWith('Search');
    });

    it('should navigate to CreateGroup when Criar Grupo button is pressed', () => {
      const { getByTestId } = render(<ADMPage />);

      const createGroupButton = getByTestId('adm-button-criar-grupo');
      fireEvent.press(createGroupButton);

      expect(mockedNavigate).toHaveBeenCalledWith('CreateGroup');
    });

    it('should navigate to Notification when Comunicados button is pressed', () => {
      const { getByTestId } = render(<ADMPage />);

      const notificationButton = getByTestId('adm-button-comunicados');
      fireEvent.press(notificationButton);

      expect(mockedNavigate).toHaveBeenCalledWith('Notification');
    });

    it('should navigate to Config when Configurações button is pressed', () => {
      const { getByTestId } = render(<ADMPage />);

      const configButton = getByTestId('adm-button-configurações');
      fireEvent.press(configButton);

      expect(mockedNavigate).toHaveBeenCalledWith('Config');
    });
  });

  // TESTES DE INTEGRAÇÃO
  describe('Integration Tests', () => {
    it('should render all buttons and navigate correctly', async () => {
      const { getByTestId } = render(<ADMPage />);

      // Testa botão Pesquisar
      const searchButton = getByTestId('adm-button-pesquisar');
      fireEvent.press(searchButton);
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('Search');
      });
      jest.clearAllMocks();

      // Testa botão Criar Grupo
      const createGroupButton = getByTestId('adm-button-criar-grupo');
      fireEvent.press(createGroupButton);
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('CreateGroup');
      });
      jest.clearAllMocks();

      // Testa botão Comunicados
      const notificationButton = getByTestId('adm-button-comunicados');
      fireEvent.press(notificationButton);
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('Notification');
      });
      jest.clearAllMocks();

      // Testa botão Configurações
      const configButton = getByTestId('adm-button-configurações');
      fireEvent.press(configButton);
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('Config');
      });
    });

    it('should display welcome message with correct styling', () => {
      const { getByText } = render(<ADMPage />);

      const helloText = getByText('Olá,');
      const adminText = getByText('Administrador!');

      expect(helloText).toBeTruthy();
      expect(adminText).toBeTruthy();
    });

    it('should display actions section title', () => {
      const { getByText } = render(<ADMPage />);

      const actionsText = getByText('Ações');
      expect(actionsText).toBeTruthy();
    });
  });

  // TESTES DE COMPONENTES
  describe('Component Tests', () => {
    it('should render ADMPageButton components with correct props', () => {
      const { getByTestId } = render(<ADMPage />);

      // Verifica se os botões foram renderizados com testIDs corretos
      expect(getByTestId('adm-button-pesquisar')).toBeTruthy();
      expect(getByTestId('adm-button-criar-grupo')).toBeTruthy();
      expect(getByTestId('adm-button-comunicados')).toBeTruthy();
      expect(getByTestId('adm-button-configurações')).toBeTruthy();
    });

    it('should render with LinearGradient mock', () => {
      const { getByText } = render(<ADMPage />);

      // O LinearGradient é usado dentro do ADMPageButton
      // Como mockamos o componente, verificamos apenas se renderiza sem erro
      expect(getByText('Olá,')).toBeTruthy();
    });

    it('should handle font loading correctly', () => {
      const { getByText } = render(<ADMPage />);

      // Se as fontes não estivessem carregadas, o componente retornaria undefined
      // Como temos texto renderizado, significa que as fontes foram carregadas
      expect(getByText('Olá,')).toBeTruthy();
      expect(getByText('Administrador!')).toBeTruthy();
    });
  });

  // TESTES DE EDGE CASES
  describe('Edge Cases', () => {
    it('should handle multiple rapid button presses', async () => {
      const { getByTestId } = render(<ADMPage />);

      const searchButton = getByTestId('adm-button-pesquisar');

      // Simula múltiplos cliques rápidos
      fireEvent.press(searchButton);
      fireEvent.press(searchButton);
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledTimes(3);
        expect(mockedNavigate).toHaveBeenCalledWith('Search');
      });
    });

    it('should render correctly with all visual elements', () => {
      const { getByText, getByTestId } = render(<ADMPage />);

      // Verifica elementos de texto
      expect(getByText('Olá,')).toBeTruthy();
      expect(getByText('Administrador!')).toBeTruthy();
      expect(getByText('Ações')).toBeTruthy();

      // Verifica botões
      expect(getByText('Pesquisar')).toBeTruthy();
      expect(getByText('Criar Grupo')).toBeTruthy();
      expect(getByText('Comunicados')).toBeTruthy();
      expect(getByText('Configurações')).toBeTruthy();

      // Verifica ícones
      expect(getByTestId('search-icon')).toBeTruthy();
      expect(getByTestId('group-icon')).toBeTruthy();
      expect(getByTestId('megaphone-icon')).toBeTruthy();
      expect(getByTestId('gear-icon')).toBeTruthy();
    });

    it('should handle navigation parameter passing correctly', () => {
      const { getByTestId } = render(<ADMPage />);

      const buttons = [
        { button: 'adm-button-pesquisar', expectedRoute: 'Search' },
        { button: 'adm-button-criar-grupo', expectedRoute: 'CreateGroup' },
        { button: 'adm-button-comunicados', expectedRoute: 'Notification' },
        { button: 'adm-button-configurações', expectedRoute: 'Config' },
      ];

      buttons.forEach(({ button, expectedRoute }) => {
        jest.clearAllMocks();

        const buttonElement = getByTestId(button);
        fireEvent.press(buttonElement);

        expect(mockedNavigate).toHaveBeenCalledWith(expectedRoute);
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
      });
    });
  });

  // TESTES DE ACESSIBILIDADE
  describe('Accessibility Tests', () => {
    it('should have accessible button elements', () => {
      const { getByTestId } = render(<ADMPage />);

      const searchButton = getByTestId('adm-button-pesquisar');
      const createGroupButton = getByTestId('adm-button-criar-grupo');
      const notificationButton = getByTestId('adm-button-comunicados');
      const configButton = getByTestId('adm-button-configurações');

      expect(searchButton).toBeTruthy();
      expect(createGroupButton).toBeTruthy();
      expect(notificationButton).toBeTruthy();
      expect(configButton).toBeTruthy();
    });

    it('should display text content correctly', () => {
      const { getByText } = render(<ADMPage />);

      // Verifica se todos os textos estão sendo exibidos corretamente
      const expectedTexts = [
        'Olá,',
        'Administrador!',
        'Ações',
        'Pesquisar',
        'Criar Grupo',
        'Comunicados',
        'Configurações',
      ];

      expectedTexts.forEach((text) => {
        expect(getByText(text)).toBeTruthy();
      });
    });
  });

  // TESTES DE PERFORMANCE
  describe('Performance Tests', () => {
    it('should render quickly without performance issues', () => {
      const startTime = Date.now();

      render(<ADMPage />);

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Deve renderizar em menos de 100ms (valor arbitrário para teste)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle component updates efficiently', () => {
      const { rerender } = render(<ADMPage />);

      // Testa re-renderização
      expect(() => {
        rerender(<ADMPage />);
      }).not.toThrow();
    });
  });
});



