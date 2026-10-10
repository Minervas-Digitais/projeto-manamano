import { DependencyList, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavigationContainerRefContext, NavigationContext } from '@react-navigation/native';

type FocusNavigation = {
  isFocused: () => boolean;
  addListener: (event: 'focus' | 'blur', callback: () => void) => () => void;
};

type FetchFailureInfo = {
  mode: 'silent' | 'refresh';
  hadData: boolean;
};

type UseFetchOptions = {
  enabled?: boolean;
  onError?: (error: unknown, info: FetchFailureInfo) => void;
};

type UseFetchResult<T> = {
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: unknown | null;
  stale: boolean;
  refetch: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
  mutate: (updater: T | ((prev: T | undefined) => T)) => void;
};

/**
 * Busca e mantém dados sincronizados com o ciclo de vida da tela.
 *
 * A busca é executada na montagem, quando a tela recebe foco e quando
 * alguma dependência muda. Também pode ser disparada manualmente por
 * `refetch()` ou `refresh()`.
 *
 * @template T Tipo dos dados retornados pelo `fetcher`.
 * @param fetcher Função assíncrona que obtém os dados.
 * @param deps Valores que, ao mudar, disparam uma nova busca.
 * @param options Configurações opcionais do hook.
 * @param options.enabled Controla se novas buscas podem ser iniciadas.
 * Quando `false`, invalida requisições em andamento e remove os listeners
 * de foco. Ao voltar para `true`, permite novas buscas.
 * @param options.onError Callback chamado quando uma requisição vigente
 * falha, recebendo o erro e informações sobre o contexto da falha.
 * @returns Os dados, estados e operações para controlar as buscas.
 *
 * @remarks
 * - `loading` indica o carregamento inicial; `refreshing` indica uma
 * atualização manual, como o pull-to-refresh.
 * - `error` expõe falhas quando não há dados ou quando um refresh manual
 * falha. Falhas silenciosas com dados existentes preservam os dados,
 * limpam `error` e sinalizam `stale`.
 * - `stale` indica que uma atualização falhou e os dados podem estar
 * desatualizados.
 * - `refetch()` e `refresh()` retornam `true` se a requisição terminou
 * sem erro e `false` se falhou. Isso não garante que os dados foram
 * aplicados: respostas de requisições invalidadas são descartadas.
 * - As requisições HTTP não são canceladas; respostas invalidadas são
 * ignoradas quando chegam.
 */
export default function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
  { enabled = true, onError }: UseFetchOptions = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [stale, setStale] = useState(false);

  const fetcherRef = useRef(fetcher);
  const enabledRef = useRef(enabled);
  const onErrorRef = useRef(onError);
  const dataRef = useRef<T | undefined>(undefined);
  const requestSeq = useRef(0);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    // Refs acompanham o último commit; efeito declarado antes do de enable
    // para garantir a ordem ref → invalidação.
    fetcherRef.current = fetcher;
    enabledRef.current = enabled;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (prevEnabledRef.current && !enabled) {
      // desabilita: invalida respostas em andamento e libera os spinners
      requestSeq.current += 1;
      setLoading(false);
      setRefreshing(false);
    }
    prevEnabledRef.current = enabled;
  }, [enabled]);

  const navigationContext = useContext(NavigationContext);
  const rootContext = useContext(NavigationContainerRefContext);
  const navigation = (navigationContext ?? rootContext) as unknown as FocusNavigation | undefined;

  const run = useCallback(async (mode: 'silent' | 'refresh'): Promise<boolean> => {
    if (!enabledRef.current) return true;

    const seq = ++requestSeq.current;

    if (mode === 'refresh') {
      setRefreshing(true);
    } else if (dataRef.current === undefined) {
      setLoading(true);
    }

    try {
      const result = await fetcherRef.current();
      // superada: estado pertence à mais nova; o retorno é desta chamada
      if (seq !== requestSeq.current) return true;
      dataRef.current = result;
      setData(result);
      setError(null);
      setStale(false);
      return true;
    } catch (err) {
      // superada: esta chamada falhou (→ false); o estado é da mais nova
      if (seq !== requestSeq.current) return false;
      const hadData = dataRef.current !== undefined;
      if (hadData && mode === 'silent') {
        // falha silenciosa com dados: mantém o conteúdo, limpa erro anterior
        setError(null);
        setStale(true);
      } else {
        setError(err);
        if (hadData) {
          setStale(true);
        }
      }
      onErrorRef.current?.(err, { mode, hadData });
      return false;
    } finally {
      // Só a requisição corrente libera os spinners (invalidações externas
      // limpam no efeito de disable).
      if (seq === requestSeq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return undefined;

    if (!navigation) {
      run('silent');
      return undefined;
    }

    let active = false;

    const execute = () => {
      if (enabledRef.current) run('silent');
    };

    if (navigation.isFocused()) {
      execute();
      active = true;
    }

    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (active) return;
      execute();
      active = true;
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      active = false;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, run, enabled, ...deps]);

  // Atualização otimista local (ex.: marcar notificação como lida)
  const mutate = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setData((prev) => {
      const next =
        typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater;
      dataRef.current = next;
      return next;
    });
  }, []);

  return {
    data,
    loading,
    refreshing,
    error,
    stale,
    refetch: () => run('silent'),
    refresh: () => run('refresh'),
    mutate,
  };
}
