import { useState } from "react";
import type { Screen } from "../../types/navigation";
import type { ReservationStatus } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";

interface MyReservationsProps {
  go: (s: Screen) => void;
}

export function MyReservations({ go }: MyReservationsProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [statuses, setStatuses] = useState<ReservationStatus[]>(["Confirmada", "Confirmada"]);

  const upcoming = [
    { date: "19/09/2026", time: "20:00", guests: 3, area: "🏠 Dentro", code: "#R-1048" },
    { date: "03/10/2026", time: "19:30", guests: 2, area: "🌿 Rua", code: "#R-1092" },
  ];
  const past = [
    {
      date: "05/08/2026",
      time: "21:00",
      guests: 4,
      area: "🏠 Dentro",
      code: "#R-0991",
      status: "Concluída" as ReservationStatus,
    },
    {
      date: "12/07/2026",
      time: "19:00",
      guests: 2,
      area: "🌿 Rua",
      code: "#R-0872",
      status: "Cancelada" as ReservationStatus,
    },
  ];

  const cancel = (i: number) =>
    setStatuses((prev) => prev.map((s, j) => (j === i ? "Cancelada" : s)));

  return (
    <>
      <PageTitle
        title="Minhas reservas"
        action={
          <Button primary onClick={() => go("reserve")}>
            + Nova reserva
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        {[
          { key: "upcoming", label: "Próximas" },
          { key: "past", label: "Anteriores" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as typeof tab)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer"
            style={{
              background: tab === key ? colors.red : colors.paper,
              color: tab === key ? "white" : colors.ink,
              border: `1px solid ${tab === key ? colors.red : colors.border}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upcoming" ? (
        <div className="grid gap-3">
          {upcoming.map((r, i) => (
            <Card key={r.code}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: colors.ink }}>
                    {r.date} · {r.time}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {r.guests} pessoas · {r.area} · {r.code}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={statuses[i]} />
                  {statuses[i] === "Confirmada" && (
                    <Button danger onClick={() => cancel(i)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {past.map((r) => (
            <Card key={r.code}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: colors.ink }}>
                    {r.date} · {r.time}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {r.guests} pessoas · {r.area} · {r.code}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
