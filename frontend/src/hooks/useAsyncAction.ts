import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_COOLDOWN_MS = 500;

type AsyncActionOptions = {
  cooldownMs?: number;
};

type AsyncActionResult<TArgs extends unknown[]> = {
  execute: (...args: TArgs) => Promise<void>;
  isLoading: boolean;
  isBusy: boolean;
};

/**
 * Executa uma ação assíncrona bloqueando novos acionamentos enquanto ela
 * estiver em andamento e por um curto período após a conclusão.
 *
 * O bloqueio durante a requisição evita duplo toque. O cooldown evita que um
 * toque acidental logo após a conclusão dispare a ação novamente.
 *
 * @param action Ação assíncrona que será executada.
 * @param options.cooldownMs Tempo de bloqueio após a conclusão (padrão: 500ms).
 * @returns `execute` para disparar a ação, `isLoading` enquanto a requisição
 * está pendente e `isBusy` enquanto o botão deve permanecer desabilitado.
 */
export default function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void> | void,
  { cooldownMs = DEFAULT_COOLDOWN_MS }: AsyncActionOptions = {},
): AsyncActionResult<TArgs> {
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const lockedRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      if (lockedRef.current) return;

      lockedRef.current = true;
      setIsLoading(true);
      setIsBusy(true);

      try {
        await actionRef.current(...args);
      } finally {
        if (!mountedRef.current) return;

        setIsLoading(false);
        cooldownRef.current = setTimeout(() => {
          lockedRef.current = false;
          setIsBusy(false);
        }, cooldownMs);
      }
    },
    [cooldownMs],
  );

  return { execute, isLoading, isBusy };
}
