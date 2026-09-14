import type { Screen } from "../../types/navigation";
import { colors } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

interface ClientHomeProps {
  go: (s: Screen) => void;
}

export function ClientHome({ go }: ClientHomeProps) {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold" style={{ color: colors.ink }}>
          Olá, Marina 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.muted }}>
          Bem-vinda ao Forno & Mesa.
        </p>
      </div>

      {/* Primary CTA */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold" style={{ color: colors.ink }}>
              Fazer uma reserva
            </h2>
            <p className="mt-1 text-sm" style={{ color: colors.muted }}>
              Escolha data, horário e área preferida.
            </p>
          </div>
          <Button primary onClick={() => go("reserve")}>
            Reservar mesa →
          </Button>
        </div>
      </Card>

      {/* Next reservation */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.muted }}>
            Próxima reserva
          </span>
          <StatusBadge status="Confirmada" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-lg font-semibold" style={{ color: colors.ink }}>
              Sábado, 19/09 · 20:00
            </p>
            <p className="mt-1 text-sm" style={{ color: colors.muted }}>
              3 pessoas · 🏠 Salão interno · #R-1048
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => go("my-reservations")}>Ver detalhes</Button>
            <Button danger>Cancelar</Button>
          </div>
        </div>
      </Card>

      {/* Secondary actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => go("my-reservations")}
          className="rounded-xl border p-4 text-left transition hover:border-[#A6422D] cursor-pointer"
          style={{ background: colors.paper, borderColor: colors.border }}
        >
          <div className="text-xl mb-1">🗂️</div>
          <div className="text-sm font-semibold" style={{ color: colors.ink }}>
            Minhas reservas
          </div>
          <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
            Histórico e próximas
          </div>
        </button>
        <button
          type="button"
          onClick={() => go("reserve")}
          className="rounded-xl border p-4 text-left transition hover:border-[#A6422D] cursor-pointer"
          style={{ background: colors.paper, borderColor: colors.border }}
        >
          <div className="text-xl mb-1">🕐</div>
          <div className="text-sm font-semibold" style={{ color: colors.ink }}>
            Ver disponibilidade
          </div>
          <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
            Horários livres de hoje
          </div>
        </button>
      </div>
    </>
  );
}
