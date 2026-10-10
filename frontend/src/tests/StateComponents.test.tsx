import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import RetryButton from '../components/RetryButton/RetryButton';

describe('LoadingState', () => {
  it('renderiza com o texto padrão e testID padrão', () => {
    const { getByTestId, getByText } = render(<LoadingState />);

    expect(getByTestId('loading-state')).toBeTruthy();
    expect(getByTestId('loading-state-indicator')).toBeTruthy();
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('aceita texto e testID customizados e renderiza inline', () => {
    const { getByTestId, getByText, queryByText } = render(
      <LoadingState text="Buscando membros..." testID="members-loading" inline />,
    );

    expect(getByTestId('members-loading')).toBeTruthy();
    expect(getByText('Buscando membros...')).toBeTruthy();
    expect(queryByText('Carregando...')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renderiza a mensagem de vazio', () => {
    const { getByTestId, getByText } = render(<EmptyState text="Nenhuma publicação encontrada" />);

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('Nenhuma publicação encontrada')).toBeTruthy();
  });

  it('aceita testID customizado e ícone', () => {
    const { getByTestId } = render(
      <EmptyState text="Vazio" testID="posts-empty" inline icon={<></>} />,
    );

    expect(getByTestId('posts-empty')).toBeTruthy();
  });
});

describe('ErrorState', () => {
  it('renderiza a mensagem de erro e o botão de retry padrão', () => {
    const onRetry = jest.fn();
    const { getByTestId, getByText } = render(<ErrorState onRetry={onRetry} />);

    expect(getByTestId('error-state')).toBeTruthy();
    expect(getByText('Não foi possível carregar os dados.')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  it('chama onRetry ao pressionar Tentar novamente', () => {
    const onRetry = jest.fn();
    const { getByTestId, getByText } = render(
      <ErrorState
        text="Não foi possível carregar os membros."
        retryText="Tentar de novo"
        onRetry={onRetry}
        testID="members-error"
        inline
      />,
    );

    expect(getByText('Não foi possível carregar os membros.')).toBeTruthy();
    fireEvent.press(getByText('Tentar de novo'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(getByTestId('retry-button')).toBeTruthy();
  });
});

describe('RetryButton', () => {
  it('dispara onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<RetryButton onPress={onPress} />);

    fireEvent.press(getByTestId('retry-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
