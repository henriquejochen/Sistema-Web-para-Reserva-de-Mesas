import type { Screen } from "../../types/navigation";
import { colors } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";


interface ClientHomeProps {
  go: (s: Screen) => void;
}

export function ClientHome({ go }: ClientHomeProps) {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold" style={{ color: colors.ink }}>
          Bem-vindo à Di Napoli
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.muted }}>
          Reserve sem criar conta. Informe seus dados somente ao finalizar.
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

      <Card className="mb-4"><h2 className="font-semibold">Já fez uma reserva?</h2><p className="mt-2 mb-4 text-sm">Use o link exclusivo salvo na confirmação para consultar ou cancelar sua reserva.</p><Button onClick={() => go("my-reservations")}>Consultar pelo link</Button></Card>
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
            Consultar reserva
          </div>
          <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
            Acesso pelo link exclusivo
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
