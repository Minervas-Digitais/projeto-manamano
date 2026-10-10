import React from 'react';
import { fireEvent, render, renderHook, waitFor, act } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import useFetch from '../hooks/useFetch';

type HarnessProps = {
  fetcher: () => Promise<any>;
  deps?: any[];
  enabled?: boolean;
  onError?: (error: unknown, info: { mode: string; hadData: boolean }) => void;
};

function Harness({ fetcher, deps = [], enabled = true, onError }: HarnessProps) {
  const query = useFetch(fetcher, deps, { enabled, onError });

  return (
    <View>
      <Text testID="data">
        {query.data === undefined ? 'undefined' : JSON.stringify(query.data)}
      </Text>
      <Text testID="loading">{query.loading ? 'true' : 'false'}</Text>
      <Text testID="refreshing">{query.refreshing ? 'true' : 'false'}</Text>
      <Text testID="error">{query.error ? 'has-error' : 'no-error'}</Text>
      <Text testID="stale">{query.stale ? 'is-stale' : 'is-fresh'}</Text>
      <TouchableOpacity testID="refresh" onPress={() => query.refresh()} />
      <TouchableOpacity testID="refetch" onPress={() => query.refetch()} />
      <TouchableOpacity
        testID="mutate"
        onPress={() => query.mutate((prev: any) => ({ ...prev, mutated: true }))}
      />
    </View>
  );
}

describe('useFetch', () => {
  it('busca os dados na montagem e para de carregar', async () => {
    const fetcher = jest.fn().mockResolvedValue({ name: 'Ana' });

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"name":"Ana"}');
    });
    expect(getByTestId('loading')).toHaveTextContent('false');
    expect(getByTestId('error')).toHaveTextContent('no-error');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('mantém loading enquanto a requisição está pendente', async () => {
    let resolveFetch: (value: any) => void = () => {};
    const fetcher = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('true');
    });

    resolveFetch({ ok: true });

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
      expect(getByTestId('data')).toHaveTextContent('{"ok":true}');
    });
  });

  it('expõe o erro quando ainda não há dados e chama onError', async () => {
    const onError = jest.fn();
    const fetcher = jest.fn().mockRejectedValue(new Error('boom'));

    const { getByTestId } = render(<Harness fetcher={fetcher} onError={onError} />);

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent('has-error');
    });
    expect(getByTestId('data')).toHaveTextContent('undefined');
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ mode: 'silent', hadData: false }),
    );
  });

  it('refetch() sem dados expõe o erro', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ n: 1 })
      .mockRejectedValueOnce(new Error('fail'));

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    });

    fireEvent.press(getByTestId('refetch'));

    // com dados existentes, a falha silenciosa não esconde o conteúdo
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
    expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    expect(getByTestId('error')).toHaveTextContent('no-error');
  });

  it('descarta a resposta de uma requisição superada por uma mais nova', async () => {
    let resolveFirst: (value: any) => void = () => {};
    const fetcher = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ n: 'novo' });

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    // requisição do mount fica pendurada
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('true');
    });

    // refetch dispara uma segunda requisição, que resolve primeiro
    fireEvent.press(getByTestId('refetch'));
    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":"novo"}');
      expect(getByTestId('loading')).toHaveTextContent('false');
    });

    // a primeira resolve depois, com dados antigos: não deve sobrescrever
    await act(async () => {
      resolveFirst({ n: 'velho' });
    });

    expect(getByTestId('data')).toHaveTextContent('{"n":"novo"}');
    expect(getByTestId('loading')).toHaveTextContent('false');
    expect(getByTestId('error')).toHaveTextContent('no-error');
  });

  it('refetch() superada devolve o resultado da própria chamada, sem tocar no estado', async () => {
    let rejectA: (error: Error) => void = () => {};
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ n: 'mount' })
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectA = reject;
          }),
      )
      .mockResolvedValueOnce({ n: 'novo' });

    const { result } = renderHook(() => useFetch(fetcher, []));

    await waitFor(() => {
      expect(result.current.data).toEqual({ n: 'mount' });
    });

    // A fica pendurada e B a supera; B resolve primeiro
    const superseded = result.current.refetch();
    const winner = result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual({ n: 'novo' });
    });
    await expect(winner).resolves.toBe(true);

    // A falha depois: a chamada retorna false, mas o estado é de B
    await act(async () => {
      rejectA(new Error('superada falhou'));
    });
    await expect(superseded).resolves.toBe(false);

    expect(result.current.data).toEqual({ n: 'novo' });
    expect(result.current.error).toBeNull();
    expect(result.current.stale).toBe(false);
  });

  it('refresh() sinaliza refreshing e expõe a falha mesmo com dados', async () => {
    const onError = jest.fn();
    let rejectFetch: (error: Error) => void = () => {};
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ n: 1 })
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFetch = reject;
          }),
      );

    const { getByTestId } = render(<Harness fetcher={fetcher} onError={onError} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    });

    fireEvent.press(getByTestId('refresh'));

    await waitFor(() => {
      expect(getByTestId('refreshing')).toHaveTextContent('true');
    });

    rejectFetch(new Error('refresh failed'));

    await waitFor(() => {
      expect(getByTestId('refreshing')).toHaveTextContent('false');
      expect(getByTestId('error')).toHaveTextContent('has-error');
    });
    // o conteúdo antigo permanece na tela
    expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ mode: 'refresh', hadData: true }),
    );
  });

  it('falha silenciosa com dados limpa um erro anterior de refresh', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ n: 1 })
      .mockRejectedValueOnce(new Error('offline'))
      .mockRejectedValueOnce(new Error('offline'));

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    });

    fireEvent.press(getByTestId('refresh'));
    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent('has-error');
    });

    fireEvent.press(getByTestId('refetch'));

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent('no-error');
    });
    expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    expect(getByTestId('stale')).toHaveTextContent('is-stale');
  });

  it('refresh() bem-sucedido atualiza os dados', async () => {
    const fetcher = jest.fn().mockResolvedValueOnce({ n: 1 }).mockResolvedValueOnce({ n: 2 });

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    });

    fireEvent.press(getByTestId('refresh'));

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":2}');
    });
    expect(getByTestId('error')).toHaveTextContent('no-error');
  });

  it('stale fica true quando falha com dados e volta a false após sucesso', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ name: 'Ana' })
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ name: 'Ana' });

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"name":"Ana"}');
    });
    expect(getByTestId('stale')).toHaveTextContent('is-fresh');

    fireEvent.press(getByTestId('refresh'));

    await waitFor(() => {
      expect(getByTestId('stale')).toHaveTextContent('is-stale');
    });
    // dados antigos permanecem na tela
    expect(getByTestId('data')).toHaveTextContent('{"name":"Ana"}');

    fireEvent.press(getByTestId('refresh'));

    await waitFor(() => {
      expect(getByTestId('stale')).toHaveTextContent('is-fresh');
    });
  });

  it('não busca quando enabled é false', async () => {
    const fetcher = jest.fn().mockResolvedValue({ n: 1 });

    const { getByTestId } = render(<Harness fetcher={fetcher} enabled={false} />);

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(getByTestId('data')).toHaveTextContent('undefined');
  });

  it('inicia a busca quando enabled muda de false para true', async () => {
    const fetcher = jest.fn().mockResolvedValue({ n: 1 });

    const { rerender, getByTestId } = render(<Harness fetcher={fetcher} enabled={false} />);

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
    });
    expect(fetcher).not.toHaveBeenCalled();

    rerender(<Harness fetcher={fetcher} enabled={true} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1}');
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('desabilitar invalida a requisição em andamento e libera o spinner', async () => {
    let resolveFetch: (value: any) => void = () => {};
    const fetcher = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { rerender, getByTestId } = render(<Harness fetcher={fetcher} enabled={true} />);

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('true');
    });

    rerender(<Harness fetcher={fetcher} enabled={false} />);
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
    });

    resolveFetch({ n: 1 });

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
    });
    expect(getByTestId('data')).toHaveTextContent('undefined');
    expect(getByTestId('error')).toHaveTextContent('no-error');
    expect(getByTestId('stale')).toHaveTextContent('is-fresh');
  });

  it('refaz a busca quando as deps mudam', async () => {
    const fetcher = jest.fn().mockResolvedValue({ n: 1 });

    const { rerender, getByTestId } = render(<Harness fetcher={fetcher} deps={['a']} />);

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    rerender(<Harness fetcher={fetcher} deps={['b']} />);

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  it('mutate atualiza os dados localmente', async () => {
    const fetcher = jest.fn().mockResolvedValue({ n: 1, mutated: false });

    const { getByTestId } = render(<Harness fetcher={fetcher} />);

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1,"mutated":false}');
    });

    fireEvent.press(getByTestId('mutate'));

    await waitFor(() => {
      expect(getByTestId('data')).toHaveTextContent('{"n":1,"mutated":true}');
    });
  });

  describe('refetch no focus da navegação', () => {
    const Stack = createStackNavigator();

    function ScreenA({ fetcher }: { fetcher: jest.Mock }) {
      const navigation = useNavigation<any>();
      const query = useFetch(fetcher, []);

      return (
        <View>
          <Text testID="count">
            {query.data === undefined ? '0' : String((query.data as any).n)}
          </Text>
          <TouchableOpacity testID="go-b" onPress={() => navigation.navigate('B')} />
        </View>
      );
    }

    function ScreenB() {
      const navigation = useNavigation<any>();
      return (
        <View>
          <Text>Tela B</Text>
          <TouchableOpacity testID="go-back" onPress={() => navigation.goBack()} />
        </View>
      );
    }

    it('recarrega ao voltar para a tela', async () => {
      const fetcher = jest.fn().mockResolvedValue({ n: 1 });

      const { getByTestId, findByText } = render(
        <NavigationContainer>
          <Stack.Navigator initialRouteName="A">
            <Stack.Screen name="A">{() => <ScreenA fetcher={fetcher} />}</Stack.Screen>
            <Stack.Screen name="B" component={ScreenB} />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });
      expect(await findByText('1')).toBeTruthy();

      fireEvent.press(getByTestId('go-b'));
      await findByText('Tela B');

      fireEvent.press(getByTestId('go-back'));

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(2);
      });
    });
  });
});
