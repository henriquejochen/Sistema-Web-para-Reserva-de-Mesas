import type { Screen } from "../../types/navigation";
import { colors } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface AdminHomeProps {
  go: (s: Screen) => void;
}

export function AdminHome({ go }: AdminHomeProps) {
  const stats = [
    { label: "Reservas hoje", value: "18" },
    { label: "Aguardando chegada", value: "7" },
    { label: "Mesas ocupadas", value: "6/16" },
  ];

  return (
    <>
      <PageTitle
        title="Painel"
        subtitle="Sexta-feira, 12 de setembro de 2026"
        action={<Button onClick={() => go("tables")}>Gerenciar mesas</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <p className="text-sm" style={{ color: colors.muted }}>
              {label}
            </p>
            <strong className="mt-1 block text-2xl">{value}</strong>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold" style={{ color: colors.ink }}>
            Próximas chegadas
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              { time: "19:30", name: "Carlos Mendes", guests: 4, area: "Dentro" },
              { time: "20:00", name: "Marina Lima", guests: 3, area: "Rua" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <div>
                  <strong className="text-sm" style={{ color: colors.ink }}>
                    {r.time} · {r.name}
                  </strong>
                  <p className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    {r.guests} pessoas · {r.area}
                  </p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: colors.greenLight, color: colors.green }}
                >
                  Confirmada
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Button primary onClick={() => go("daily")}>
              Ver todas as reservas
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold" style={{ color: colors.ink }}>
            Acesso rápido
          </h2>
          <div className="mt-4 grid gap-2">
            <Button full onClick={() => go("daily")}>
              Confirmar chegada de cliente
            </Button>
            <Button full onClick={() => go("tables")}>
              Ver planta das mesas
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
