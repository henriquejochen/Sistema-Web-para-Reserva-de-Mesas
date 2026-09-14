import { useState } from "react";
import type { ReservationStatus } from "../../types/reservation";
import { colors, inputClass } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function DailyReservations() {
  const [statuses, setStatuses] = useState<ReservationStatus[]>([
    "Confirmada",
    "Presente",
    "Confirmada",
  ]);
  // Simulação de horário atual do restaurante
  const [currentTime] = useState("20:05");

  const rows = [
    { time: "19:30", name: "Carlos Mendes", guests: "4", area: "Dentro" },
    { time: "20:00", name: "Marina Lima", guests: "3", area: "Rua" },
    { time: "20:30", name: "Lucas Rocha", guests: "2", area: "Dentro" },
  ];

  const update = (i: number, s: ReservationStatus) =>
    setStatuses((prev) => prev.map((v, j) => (j === i ? s : v)));

  // Calcula atraso em minutos entre horário da reserva e horário atual
  const getDelayMinutes = (resTime: string): number => {
    const [hRes, mRes] = resTime.split(":").map(Number);
    const [hCur, mCur] = currentTime.split(":").map(Number);
    return hCur * 60 + mCur - (hRes * 60 + mRes);
  };

  return (
    <>
      <PageTitle
        title="Reservas do dia"
        subtitle={`${rows.length} reservas · 12/09/2026`}
        action={
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ background: colors.paper, borderColor: colors.border, color: colors.ink }}
            >
              🕒 Hora atual: <strong>{currentTime}</strong>
            </span>
            <input className={`${inputClass} w-52`} placeholder="Buscar cliente…" />
          </div>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr style={{ color: colors.muted }}>
              {["Horário", "Cliente", "Pessoas", "Área", "Status & Alertas", "Ações"].map((h) => (
                <th key={h} className="border-b px-3 py-3 font-medium" style={{ borderColor: colors.border }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const status = statuses[i];
              const delay = getDelayMinutes(r.time);
              const isOver15 = status === "Confirmada" && delay >= 15 && delay < 30;
              const isOver30 = status === "Confirmada" && delay >= 30;

              return (
                <tr
                  key={r.name}
                  style={{
                    background: isOver30 ? "#FEF2F2" : isOver15 ? "#FFFDF5" : "transparent",
                  }}
                >
                  <td className="border-b px-3 py-4 font-semibold" style={{ borderColor: colors.border }}>
                    {r.time}
                  </td>
                  <td className="border-b px-3 py-4" style={{ borderColor: colors.border }}>
                    <div className="font-medium" style={{ color: colors.ink }}>
                      {r.name}
                    </div>
                  </td>
                  <td className="border-b px-3 py-4" style={{ borderColor: colors.border }}>
                    {r.guests}
                  </td>
                  <td className="border-b px-3 py-4" style={{ borderColor: colors.border }}>
                    {r.area}
                  </td>
                  <td className="border-b px-3 py-4" style={{ borderColor: colors.border }}>
                    <div className="grid gap-1.5">
                      <StatusBadge status={status} />

                      {/* Alerta de tempo decorrido */}
                      {isOver15 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
                          style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FCD34D" }}
                        >
                          ⚠️ +{delay} min atraso
                        </span>
                      )}

                      {isOver30 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
                          style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5" }}
                        >
                          🚨 +{delay} min atraso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border-b px-3 py-4" style={{ borderColor: colors.border }}>
                    <div className="flex flex-wrap gap-2">
                      {status === "Presente" && (
                        <Button primary onClick={() => update(i, "Concluída")}>
                          Concluir
                        </Button>
                      )}
                      {status === "Confirmada" && (
                        <Button primary onClick={() => update(i, "Presente")}>
                          Confirmar chegada
                        </Button>
                      )}
                      {(status === "Confirmada" || status === "Presente") && (
                        <Button danger onClick={() => update(i, "Cancelada")}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
