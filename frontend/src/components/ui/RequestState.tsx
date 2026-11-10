import { Button } from "./Button";
export function RequestState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  if (loading)
    return (
      <p role="status" className="py-5">
        Carregando…
      </p>
    );
  if (error)
    return (
      <div className="grid gap-3 py-4">
        <p role="alert">{error}</p>
        <Button onClick={retry}>Tentar novamente</Button>
      </div>
    );
  return null;
}
