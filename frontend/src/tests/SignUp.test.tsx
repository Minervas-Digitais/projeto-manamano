import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../pages/SignUp/SignUp';
import api from '../services/api';

// MOCKS
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    goBack: jest.fn(),
  }),
}));

jest.mock('../services/api');

jest.mock('expo-font', () => ({
  useFonts: () => [true], // simula q as fontes carregaram
}));

(global as any).alert = jest.fn();

describe('SignUp', () => {
  const apiPostMock = api.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve renderizar todos os campos do formulario e o botao', () => {
    const { getByText, getByLabelText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );
    expect(getByText('Olá,')).toBeTruthy();
    expect(getByText('crie a sua conta!')).toBeTruthy();

    expect(getByLabelText('Nome Completo')).toBeTruthy();
    expect(getByLabelText('E-mail')).toBeTruthy();
    expect(getByLabelText('WhatsApp')).toBeTruthy();
    expect(getByLabelText('Senha')).toBeTruthy();

    expect(getByText('Cadastrar')).toBeTruthy();
  });

  it('Deve submeter o formulario com sucesso e navegar pra tela de SignIn', async () => {
    apiPostMock.mockResolvedValue({ data: { sucess: true } });

    const { getByText, getByLabelText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'Guilherme Teste');
    fireEvent.changeText(getByLabelText('E-mail'), 'guilherme@teste.com');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 9888-7777');
    fireEvent.changeText(getByLabelText('Senha'), 'senhamuitoforte123');

    fireEvent.press(getByText('Cadastrar'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(apiPostMock).toHaveBeenCalledWith('/user', {
      fullName: 'Guilherme Teste',
      email: 'guilherme@teste.com',
      phone: '2198887777',
      hash: 'senhamuitoforte123',
    });

    expect(mockedNavigate).toHaveBeenLastCalledWith('SignIn');
  });

  it('Deve exibir um alerta de erro se o email ou celular ja estiver em uso', async () => {
    apiPostMock.mockResolvedValue({ data: { code: 'P2002' } });
    const { getByText, getByLabelText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'Usuário Repetido');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 91234-5678');
    fireEvent.changeText(getByLabelText('Senha'), 'outraSenha');
    fireEvent.changeText(getByLabelText('E-mail'), 'repetido@teste.com');

    fireEvent.press(getByText('Cadastrar'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(global.alert).toHaveBeenCalledWith(
      'Não foi possível criar uma conta. O e-mail ou o celular já está associado a outra conta!',
    );

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('Deve exibir mensagens de erro para campos obrigatórios vazios', async () => {
    const { getByText, findAllByText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.press(getByText('Cadastrar'));

    const errorMessages = await findAllByText('Campo obrigatório');
    expect(errorMessages).toHaveLength(4);

    expect(api.post).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});
