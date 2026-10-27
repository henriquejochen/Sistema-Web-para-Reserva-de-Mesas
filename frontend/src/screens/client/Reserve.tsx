import type { Screen } from "../../types/navigation";
import type { BookingDraft, GuestContact } from "../../types/reservation";
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
  contact: GuestContact;
  setContact: (c: GuestContact) => void;
  onConfirm: () => void;
  error: string;
}

export function Reserve({ go, booking, setBooking, contact, setContact, onConfirm, error }: ReserveProps) {

  // Dom=0, Seg=1, Ter=2 → fechado. Qua=3, Qui…Sab=6 → aberto
  // Usamos UTC para evitar fuso alterar o dia
  const isClosedDay = (iso: string) => {
    if (!iso) return false;
    const [y, m, d] = iso.split("-").map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return day === 0 || day === 1 || day === 2; // dom, seg, ter
  };

  const closedDayWarning = isClosedDay(booking.date);
  const canConfirm = Boolean(booking.date >= todayISO && booking.time && !closedDayWarning && contact.name.trim().length >= 2 && /^(?:[0-9]{10}|[0-9]{11})$/.test(contact.phone.replace(/\D/g, "")) && new Date(booking.date + "T" + booking.time) > new Date());


  const handleDateChange = (value: string) => {
    if (isClosedDay(value)) {
      setBooking({ ...booking, date: value, time: "" });
    } else {
      setBooking({ ...booking, date: value, time: "" });
    }
  };

  return (
    <>
      <p className="mb-4 text-xs" style={{color: colors.muted}}>Protótipo: use dados fictícios. Horários ilustrativos; nenhuma reserva é enviada à pizzaria.</p>
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
                  onChange={(e) => handleDateChange(e.target.value)}
                  style={closedDayWarning ? { borderColor: colors.red } : {}}
                />
              </Field>
              <Field label="Número de pessoas">
                <GuestDropdown
                  value={booking.guests}
                  onChange={(n) => setBooking({ ...booking, guests: n })}
                />
              </Field>
            </div>
            {closedDayWarning && (
              <p className="mt-2 text-xs font-medium" style={{ color: colors.red }}>
                ⚠️ Fechado aos domingos, segundas e terças. Escolha de quarta a sábado.
              </p>
            )}
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

          <Card>
            <h2 className="mb-2 font-semibold">Seus dados para finalizar</h2>
            <p className="mb-4 text-sm" style={{color: colors.muted}}>Sem cadastro e sem senha. O telefone será usado apenas para contato, sem envio de código.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="guest-name" className="block mb-1 text-sm">Nome</label><input id="guest-name" autoComplete="name" required maxLength={80} className={inputClass} value={contact.name} onChange={e => setContact({...contact, name: e.target.value})}/></div>
              <div><label htmlFor="guest-phone" className="block mb-1 text-sm">Telefone com DDD</label><input id="guest-phone" type="tel" autoComplete="tel-national" required maxLength={20} placeholder="(48) 99999-0000" className={inputClass} value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})}/><p className="mt-1 text-xs">Informe 10 ou 11 dígitos, incluindo DDD.</p></div>
            </div>
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
            {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
            <div className="my-4">
              <Divider />
            </div>
            <div className="grid gap-2">
              <Button
                primary
                full
                disabled={!canConfirm}
                onClick={onConfirm}
              >
                {canConfirm ? `Confirmar reserva às ${booking.time} →` : "Preencha data, horário, nome e telefone"}
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
