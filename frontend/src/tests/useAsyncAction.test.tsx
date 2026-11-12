import { act, renderHook, waitFor } from '@testing-library/react-native';
import useAsyncAction from '../hooks/useAsyncAction';

describe('useAsyncAction', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('executa a ação apenas uma vez enquanto estiver pendente', async () => {
    let resolveAction: () => void = () => {};
    const action = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      result.current.execute();
      result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isBusy).toBe(true);

    await act(async () => {
      resolveAction();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('mantém o bloqueio durante o cooldown e libera após o tempo configurado', async () => {
    jest.useFakeTimers();
    const action = jest.fn();

    const { result } = renderHook(() => useAsyncAction(action, { cooldownMs: 500 }));

    await act(async () => {
      await result.current.execute('primeira');
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isBusy).toBe(true);

    await act(async () => {
      await result.current.execute('segunda');
    });
    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isBusy).toBe(false);

    await act(async () => {
      await result.current.execute('terceira');
    });
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('libera o botão mesmo quando a ação falha', async () => {
    const action = jest.fn(async () => {
      throw new Error('falha');
    });

    const { result } = renderHook(() => useAsyncAction(action));
    let actionError: unknown;

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        actionError = error;
      }
    });

    expect(actionError).toEqual(new Error('falha'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isBusy).toBe(true);
  });
});
