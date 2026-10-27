import type { Screen } from "../../types/navigation";
import type { BookingDraft } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Divider } from "../../components/ui/Divider";
import { BookingSummary } from "../../components/reservation/BookingSummary";

interface TimesProps {
  go: (s: Screen) => void;
  booking: BookingDraft;
  setBooking: (b: BookingDraft) => void;
}

export function Times({ go, booking, setBooking }: TimesProps) {
  const slots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
  const fullSlots = new Set(["19:30", "18:00"]);

  const areaLabel = areaOptions.find((a) => a.value === booking.area);
  const dateFormatted = booking.date
    ? new Date(booking.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <>
      <PageTitle
        title="Horários disponíveis"
        subtitle={dateFormatted}
        action={<Button onClick={() => go("reserve")}>← Alterar dados</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card>
          <p className="mb-4 text-sm" style={{ color: colors.muted }}>
            Horários marcados como <strong>Lotado</strong> não têm mesa disponível para{" "}
            <strong>
              {booking.guests} {booking.guests === 1 ? "pessoa" : "pessoas"}
            </strong>
            {areaLabel && booking.area !== "any" ? ` na área ${areaLabel.icon} ${areaLabel.label}` : ""}.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((time) => {
              const full = fullSlots.has(time);
              const active = booking.time === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={full}
                  onClick={() => setBooking({ ...booking, time })}
                  className="rounded-xl border-2 py-4 text-center transition-all active:scale-[0.97] cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: active ? colors.red : colors.paper,
                    borderColor: active ? colors.red : full ? colors.border : colors.border,
                    color: active ? "white" : full ? colors.muted : colors.ink,
                    opacity: full ? 0.5 : 1,
                  }}
                >
                  <span className="block text-base font-bold">{time}</span>
                  <span className="mt-0.5 block text-xs">
                    {full ? "Lotado" : active ? "Selecionado ✓" : "Disponível"}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Summary sidebar */}
        <div className="grid gap-4 self-start">
          <Card>
            <h3 className="mb-4 font-semibold" style={{ color: colors.ink }}>
              Sua reserva
            </h3>
            <BookingSummary booking={booking} />
            <div className="my-4">
              <Divider />
            </div>
            <div className="grid gap-2">
              <Button
                primary
                full
                disabled={!booking.time}
                onClick={() => go("reserve")}
              >
                Informar meus dados →
              </Button>
              <Button full onClick={() => go("reserve")}>
                Voltar
              </Button>
            </div>
          </Card>
          <div
            className="rounded-xl border p-4 text-xs"
            style={{ borderColor: colors.border, color: colors.muted }}
          >
            <strong className="mb-1 block" style={{ color: colors.ink }}>
              Política de cancelamento
            </strong>
            Cancelamentos gratuitos até 2h antes. Tolerância de 15 min na chegada.
          </div>
        </div>
      </div>
    </>
  );
}
