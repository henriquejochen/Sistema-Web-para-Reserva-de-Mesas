import type { Screen } from "../../types/navigation";
import type { BookingDraft } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Divider } from "../../components/ui/Divider";
import { StatusBadge } from "../../components/ui/StatusBadge";

interface ConfirmationProps {
  go: (s: Screen) => void;
  booking: BookingDraft;
  resetBooking: () => void;
}

export function Confirmation({ go, booking, resetBooking }: ConfirmationProps) {
  const areaLabel = areaOptions.find((a) => a.value === booking.area);
  const dateFormatted = booking.date
    ? new Date(booking.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: colors.greenLight }}
        >
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-semibold" style={{ color: colors.ink }}>
          Reserva confirmada!
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.muted }}>
          Enviamos os detalhes para seu e-mail.
        </p>

        <div className="my-5">
          <Divider />
        </div>

        <div className="my-5 grid gap-3 text-left">
          {[
            { label: "Data", value: dateFormatted },
            { label: "Horário", value: booking.time },
            { label: "Pessoas", value: `${booking.guests} pessoas` },
            { label: "Área", value: areaLabel ? `${areaLabel.icon} ${areaLabel.label}` : "—" },
            { label: "Código", value: "#R-1049" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span style={{ color: colors.muted }}>{label}</span>
              <strong style={{ color: colors.ink }}>{value}</strong>
            </div>
          ))}
          <div className="flex justify-between text-sm">
            <span style={{ color: colors.muted }}>Status</span>
            <StatusBadge status="Confirmada" />
          </div>
        </div>

        {booking.note && (
          <div
            className="mb-5 rounded-lg p-3 text-left text-xs"
            style={{ background: colors.cream, color: colors.muted }}
          >
            <strong className="block mb-0.5" style={{ color: colors.ink }}>
              Observação
            </strong>
            {booking.note}
          </div>
        )}

        <div className="my-5">
          <Divider />
        </div>

        <div className="mt-5 grid gap-2">
          <Button
            primary
            full
            onClick={() => {
              resetBooking();
              go("my-reservations");
            }}
          >
            Ver minhas reservas
          </Button>
          <Button
            full
            onClick={() => {
              resetBooking();
              go("client");
            }}
          >
            Voltar ao início
          </Button>
        </div>
      </Card>
    </div>
  );
}
