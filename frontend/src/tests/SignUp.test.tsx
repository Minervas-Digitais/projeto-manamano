import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
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

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

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
      password: 'senhamuitoforte123',
    });

    expect(mockedNavigate).toHaveBeenLastCalledWith('SignIn');

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Cadastro realizado',
      text2: 'Seu cadastro foi realizado com sucesso!',
    });
  });

  it('Deve exibir um alerta de erro se o email ou celular ja estiver em uso', async () => {
    apiPostMock.mockRejectedValue({
      response: {
        status: 409,
      },
      isAxiosError: true,
    });
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

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Erro no cadastro',
      text2: 'E-mail ou celular já está associado a outra conta!',
    });

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

  it('Deve rejeitar e-mail malformado', async () => {
    const { getByText, getByLabelText, findByText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'Nome Valido');
    fireEvent.changeText(getByLabelText('E-mail'), 'email-invalido');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 98888-7777');
    fireEvent.changeText(getByLabelText('Senha'), 'senha12345');

    fireEvent.press(getByText('Cadastrar'));

    expect(await findByText('E-mail inválido')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('Deve rejeitar senha de um caractere', async () => {
    const { getByText, getByLabelText, findByText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'Nome Valido');
    fireEvent.changeText(getByLabelText('E-mail'), 'valido@teste.com');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 98888-7777');
    fireEvent.changeText(getByLabelText('Senha'), '1');

    fireEvent.press(getByText('Cadastrar'));

    expect(await findByText('A senha deve ter no mínimo 8 caracteres')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('Deve rejeitar nome com menos de 3 caracteres', async () => {
    const { getByText, getByLabelText, findByText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'Ab');
    fireEvent.changeText(getByLabelText('E-mail'), 'valido@teste.com');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 98888-7777');
    fireEvent.changeText(getByLabelText('Senha'), 'senha12345');

    fireEvent.press(getByText('Cadastrar'));

    expect(await findByText('O nome deve ter no mínimo 3 caracteres')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('Deve rejeitar nome malformado com números ou caracteres especiais', async () => {
    const { getByText, getByLabelText, findByText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), 'João123');
    fireEvent.changeText(getByLabelText('E-mail'), 'valido@teste.com');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 98888-7777');
    fireEvent.changeText(getByLabelText('Senha'), 'senha12345');

    fireEvent.press(getByText('Cadastrar'));

    expect(await findByText('Apenas letras são permitidas')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('Deve aceitar nome válido com acentos e aplicar trim ao enviar', async () => {
    apiPostMock.mockResolvedValue({ data: { success: true } });

    const { getByText, getByLabelText } = render(
      <SignUp navigation={{ navigate: mockedNavigate }} />,
    );

    fireEvent.changeText(getByLabelText('Nome Completo'), '  Vitória Conceição  ');
    fireEvent.changeText(getByLabelText('E-mail'), 'vitoria@teste.com');
    fireEvent.changeText(getByLabelText('WhatsApp'), '(21) 98888-7777');
    fireEvent.changeText(getByLabelText('Senha'), 'senha12345');

    fireEvent.press(getByText('Cadastrar'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(apiPostMock).toHaveBeenCalledWith('/user', {
      fullName: 'Vitória Conceição',
      email: 'vitoria@teste.com',
      phone: '21988887777',
      password: 'senha12345',
    });
  });
});
