'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api-client';

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Centralizes loading/error handling so pages never leave a fetch's rejection
// unhandled — every page gets a real loading/error/data tri-state for free.
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): ApiDataState<T> & { reload: () => void } {
  const [state, setState] = useState<ApiDataState<T>>({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoFetcher = useCallback(fetcher, deps);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    memoFetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Something went wrong.';
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [memoFetcher]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    memoFetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : 'Something went wrong.';
        setState({ data: null, loading: false, error: message });
      });
  }, [memoFetcher]);

  return { ...state, reload };
}
