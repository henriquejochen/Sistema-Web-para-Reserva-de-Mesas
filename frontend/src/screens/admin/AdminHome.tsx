import { useCallback, useEffect } from "react";
import type { Screen } from "../../types/navigation";
import { colors, localDateISO } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { backend } from "../../services/backend";
import { useResource } from "../../hooks/useResource";
import { RequestState } from "../../components/ui/RequestState";
export function AdminHome({ go }: { go: (s: Screen) => void }) {
  const load = useCallback(() => backend.reservations(localDateISO()), []);
  const resource = useResource(load);
  useEffect(() => {
    const timer = window.setInterval(resource.reload, 30000);
    return () => window.clearInterval(timer);
  }, [resource.reload]);
  const today = resource.data ?? [];
  const waiting = today
    .filter((r) => r.status === "Confirmada")
    .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  const stats = [
    {
      label: "Reservas hoje",
      value: today.filter((r) => r.status !== "Cancelada").length,
    },
    { label: "Aguardando chegada", value: waiting.length },
    {
      label: "Grupos presentes",
      value: today.filter((r) => r.status === "Presente").length,
    },
  ];
  return (
    <>
      <PageTitle
        title="Painel da equipe"
        subtitle={new Date().toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        action={<Button onClick={() => go("tables")}>Gerenciar mesas</Button>}
      />
      <RequestState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {!resource.loading && !resource.error && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label}>
                <p className="text-sm" style={{ color: colors.muted }}>
                  {s.label}
                </p>
                <strong className="mt-2 block text-3xl">{s.value}</strong>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 mt-4 md:grid-cols-2">
            <Card>
              <h2 className="font-semibold">Chegadas previstas para hoje</h2>
              <div className="mt-4 grid gap-4">
                {waiting.length === 0 && (
                  <p className="text-sm">Nenhum grupo aguardando chegada.</p>
                )}
                {waiting.slice(0, 5).map((r) => (
                  <div key={r.token} className="min-w-0">
                    <strong className="text-sm break-words">
                      {r.arrivalTime || "Sem previsão"} · {r.name}
                    </strong>
                    <p className="mt-1 text-sm">{r.guests} pessoas</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button primary full onClick={() => go("daily")}>
                  Ver reservas e atrasos
                </Button>
              </div>
            </Card>
            <Card>
              <h2 className="font-semibold">Acesso rápido</h2>
              <div className="mt-4 grid gap-3">
                <Button full onClick={() => go("daily")}>
                  Reservas por dia
                </Button>
                <Button full onClick={() => go("tables")}>
                  Gerenciar mesas
                </Button>
              </div>
              <p className="mt-5 text-sm">
                A previsão de chegada ajuda a organizar a recepção dos grupos.
              </p>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
