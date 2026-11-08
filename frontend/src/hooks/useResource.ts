import { useCallback, useEffect, useState } from "react";
import { ApiError, errorMessage } from "../services/backend";

export function useResource<T>(loader: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    loader: typeof loader;
    version: number;
    data: T | null;
    error: string;
  } | null>(null);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    loader()
      .then((value) => {
        if (active) setResult({ loader, version, data: value, error: "" });
      })
      .catch((e) => {
        if (!active) return;
        setResult({ loader, version, data: null, error: errorMessage(e) });
        if (e instanceof ApiError && e.status === 401)
          window.dispatchEvent(new Event("staff-session-expired"));
      });
    return () => {
      active = false;
    };
  }, [loader, version]);
  const current =
    result?.loader === loader && result.version === version ? result : null;
  return {
    data: current?.data ?? null,
    loading: !current,
    error: current?.error ?? "",
    reload,
  };
}
