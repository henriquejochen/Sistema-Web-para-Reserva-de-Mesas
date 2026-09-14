import type { Screen } from "../../types/navigation";
import type { BookingDraft } from "../../types/reservation";
import { colors, inputClass, todayISO } from "../../constants/theme";
import { allSlots, fullSlots } from "../../constants/tables";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Divider } from "../../components/ui/Divider";
import { GuestDropdown } from "../../components/reservation/GuestDropdown";
import { AreaSelector } from "../../components/reservation/AreaSelector";
import { BookingSummary } from "../../components/reservation/BookingSummary";

interface ReserveProps {
  go: (s: Screen) => void;
  booking: BookingDraft;
  setBooking: (b: BookingDraft) => void;
}

export function Reserve({ go, booking, setBooking }: ReserveProps) {
  const canConfirm = Boolean(booking.date && booking.time);

  return (
    <>
      <PageTitle
        title="Nova reserva"
        subtitle="Escolha a data, horário e preferência de área para confirmar."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="grid gap-4">
          {/* Date + guests */}
          <Card>
            <h2 className="mb-4 font-semibold" style={{ color: colors.ink }}>
              Quando e quantos?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data">
                <input
                  type="date"
                  min={todayISO}
                  className={inputClass}
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                />
              </Field>
              <Field label="Número de pessoas">
                <GuestDropdown
                  value={booking.guests}
                  onChange={(n) => setBooking({ ...booking, guests: n })}
                />
              </Field>
            </div>
          </Card>

          {/* Inline time slot picker */}
          <Card>
            <h2 className="mb-1 font-semibold" style={{ color: colors.ink }}>
              Horário
            </h2>
            <p className="mb-4 text-sm" style={{ color: colors.muted }}>
              Horários marcados como <em>Lotado</em> não têm disponibilidade para a data escolhida.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {allSlots.map((slot) => {
                const full = fullSlots.has(slot);
                const active = booking.time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={full}
                    onClick={() => setBooking({ ...booking, time: active ? "" : slot })}
                    className="rounded-xl border-2 py-3 text-center transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      background: active ? colors.red : colors.paper,
                      borderColor: active ? colors.red : full ? colors.border : colors.border,
                      color: active ? "white" : full ? colors.muted : colors.ink,
                      opacity: full ? 0.45 : 1,
                    }}
                  >
                    <span className="block text-sm font-bold">{slot}</span>
                    <span
                      className="mt-0.5 block text-[10px]"
                      style={{ color: active ? "rgba(255,255,255,0.8)" : colors.muted }}
                    >
                      {full ? "Lotado" : active ? "Selecionado" : "Livre"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Area preference */}
          <Card>
            <h2 className="mb-1 font-semibold" style={{ color: colors.ink }}>
              Preferência de área
            </h2>
            <p className="mb-4 text-sm" style={{ color: colors.muted }}>
              O restaurante vai alocar a melhor mesa conforme sua preferência.
            </p>
            <AreaSelector
              value={booking.area}
              onChange={(a) => setBooking({ ...booking, area: a })}
            />
          </Card>

          {/* Note */}
          <Card>
            <Field label="Observação" hint="opcional">
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Ex.: cadeira de bebê, acessibilidade, aniversário…"
                value={booking.note}
                onChange={(e) => setBooking({ ...booking, note: e.target.value })}
              />
            </Field>
          </Card>
        </div>

        {/* Summary + action sidebar */}
        <div className="self-start grid gap-3">
          <Card>
            <h3 className="mb-4 font-semibold" style={{ color: colors.ink }}>
              Resumo
            </h3>
            <BookingSummary booking={booking} />
            <div className="my-4">
              <Divider />
            </div>
            <div className="grid gap-2">
              <Button
                primary
                full
                disabled={!canConfirm}
                onClick={() => go("confirmation")}
              >
                {canConfirm ? `Confirmar reserva às ${booking.time} →` : "Selecione um horário"}
              </Button>
              <Button full onClick={() => go("client")}>
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Cancellation policy & client notice */}
          <div
            className="rounded-xl border p-4 text-xs grid gap-1.5"
            style={{
              borderColor: colors.border,
              color: colors.muted,
              background: colors.paper,
            }}
          >
            <strong className="block" style={{ color: colors.ink }}>
              Regras de tolerância e chegada
            </strong>
            <p>• Cancelamento gratuito com até 2h de antecedência.</p>
            <p>
              • <strong>Após 15 min de atraso</strong>: entraremos em contato para confirmar sua chegada.
            </p>
            <p>
              • <strong>Após 30 min de atraso</strong>: a reserva poderá ser cancelada caso necessário para liberação da mesa.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
