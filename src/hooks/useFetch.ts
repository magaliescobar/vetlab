"use client";

import { useEffect, useRef, useState } from "react";

interface CacheEntry<T> {
  data: T;
  /** Generación de invalidación vigente al momento del fetch. */
  refreshKey: number;
  fetchedAt: number;
}

interface Result<T> {
  key: string;
  refreshKey: number;
  data?: T;
  error?: Error;
  /** Refetch manual en curso: conserva data/error previos mientras carga. */
  pending?: boolean;
}

interface UseFetchResult<T> {
  data: T | undefined;
  error: Error | null;
  /** true solo en la primera carga (sin data ni error todavía). */
  isPending: boolean;
  /** true mientras hay un fetch en vuelo, incluidas revalidaciones. */
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Fetcher CSR mínimo con hooks: cache por clave (staleTime), conserva la data
 * anterior mientras carga una clave nueva (placeholder) y refetch cuando
 * cambia `refreshKey`. `key: null` deshabilita el fetch.
 */
export function useFetch<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  { refreshKey = 0, staleTime = 30_000 } = {},
): UseFetchResult<T> {
  const [cache] = useState(() => new Map<string, CacheEntry<T>>());
  const [result, setResult] = useState<Result<T> | null>(null);
  const [lastData, setLastData] = useState<T>();
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // `live` se deriva en render: el resultado vigente para la clave actual,
  // o el cache fresco equivalente. Misma generación de refreshKey solamente;
  // al cambiar refreshKey la entrada vieja queda invalidada (se refetchea).
  const cached = key === null ? undefined : cache.get(key);
  const live: Result<T> | null =
    result !== null && result.key === key && result.refreshKey === refreshKey
      ? result
      : cached !== undefined && cached.refreshKey === refreshKey && key !== null
        ? { key, refreshKey, data: cached.data }
        : null;

  useEffect(() => {
    if (key === null) return;
    const entry = cache.get(key);
    if (
      entry &&
      entry.refreshKey === refreshKey &&
      Date.now() - entry.fetchedAt < staleTime
    ) {
      return;
    }
    let cancelled = false;
    fetcherRef.current()
      .then((d) => {
        if (cancelled) return;
        cache.set(key, { data: d, refreshKey, fetchedAt: Date.now() });
        setResult({ key, refreshKey, data: d });
        setLastData(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setResult({
          key,
          refreshKey,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [key, refreshKey, staleTime, attempt, cache]);

  const data = key === null ? undefined : (live?.data ?? lastData);
  const error = live?.error ?? null;
  const isFetching =
    key !== null && (live === null || live.pending === true);
  return {
    data,
    error,
    isPending: isFetching && data === undefined,
    isFetching,
    isError: error !== null,
    refetch: () => {
      if (key !== null) cache.delete(key);
      setResult((r) =>
        r !== null && r.key === key ? { ...r, pending: true } : r,
      );
      setAttempt((a) => a + 1);
    },
  };
}
