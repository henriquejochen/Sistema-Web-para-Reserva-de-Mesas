import { useCallback, useEffect, useRef, useState } from "react";
import type { Screen } from "../../types/navigation";
import type { BookingDraft, GuestContact } from "../../types/reservation";
import { colors, inputClass, localDateISO } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { GuestDropdown } from "../../components/reservation/GuestDropdown";
import { AreaSelector } from "../../components/reservation/AreaSelector";
import { BookingSummary } from "../../components/reservation/BookingSummary";
import { backend, demoMode } from "../../services/backend";
import type { Configuration, FieldErrors } from "../../services/backend";
import { useResource } from "../../hooks/useResource";
import { RequestState } from "../../components/ui/RequestState";

interface ReserveProps {
  go: (s: Screen) => void;
  booking: BookingDraft;
  setBooking: (b: BookingDraft) => void;
  contact: GuestContact;
  setContact: (c: GuestContact) => void;
  onConfirm: () => Promise<void>;
  error: string;
  fields: FieldErrors;
  busy: boolean;
  config: Configuration;
}
export function Reserve({
  go,
  booking,
  setBooking,
  contact,
  setContact,
  onConfirm,
  error,
  fields,
  busy,
  config,
}: ReserveProps) {
  const [step, setStep] = useState(1);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const { date, guests, area } = booking;
  const loadAvailability = useCallback(
    () => backend.availability({ date, guests, area }),
    [date, guests, area],
  );
  const availability = useResource(loadAvailability);
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(() => {
      if (["date", "guests", "area", "arrivalTime"].some((key) => fields[key]))
        setStep(1);
      requestAnimationFrame(() => {
        const key = Object.keys(fields)[0];
        const control = key
          ? form.current?.querySelector<HTMLElement>(
              `[name="${CSS.escape(key)}"]`,
            )
          : document.getElementById("booking-error");
        control?.focus();
        control?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [error, fields]);
  const moveStep = (value: number) => {
    setStep(value);
    requestAnimationFrame(() => {
      heading.current?.focus();
      window.scrollTo(0, 0);
    });
  };
  const fieldError = (key: string) =>
    fields[key] ? (
      <p id={key + "-error"} className="text-sm mt-2 text-red-800" role="alert">
        {fields[key]}
      </p>
    ) : null;
  const unavailable = availability.data?.available === false;
  return (
    <>
      <PageTitle
        title="Reserve sua mesa"
        subtitle="Sem conta ou senha. Sua mesa em dois passos."
      />
      <ol
        className="mb-5 grid grid-cols-2 gap-2 text-sm"
        aria-label="Etapas da reserva"
      >
        {["Sua reserva", "Dados e confirmação"].map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? "step" : undefined}
            className="rounded-xl border p-3"
            style={{
              background: step === index + 1 ? colors.redLight : "white",
              borderColor: colors.border,
            }}
          >
            <span className="font-semibold">{index + 1}.</span> {label}
          </li>
        ))}
      </ol>
      <form
        ref={form}
        aria-busy={busy}
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) moveStep(2);
          else void onConfirm();
        }}
        className="mx-auto max-w-3xl grid gap-4"
      >
        <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold">
          {step === 1 ? "Quando será sua visita?" : "Confira e confirme"}
        </h2>
        {error && (
          <div
            id="booking-error"
            tabIndex={-1}
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm"
          >
            <p>{error}</p>
            <p className="mt-2">
              Seus dados foram mantidos. Se a confirmação ficou incerta,
              consulte sua reserva ou contate a pizzaria antes de repetir.
            </p>
          </div>
        )}
        {step === 1 ? (
          <fieldset disabled={busy} className="grid gap-4 min-w-0">
            <legend className="sr-only">Dados da visita</legend>
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dia da reserva">
                  <input
                    name="date"
                    type="date"
                    required
                    className={inputClass}
                    min={localDateISO()}
                    value={booking.date}
                    aria-invalid={!!fields.date}
                    aria-describedby={fields.date ? "date-error" : undefined}
                    onChange={(e) =>
                      setBooking({ ...booking, date: e.target.value })
                    }
                  />
                  {fieldError("date")}
                </Field>
                <Field label="Número de pessoas">
                  <GuestDropdown
                    max={config.maxGuests}
                    value={booking.guests}
                    onChange={(guests) => setBooking({ ...booking, guests })}
                  />
                  {fieldError("guests")}
                </Field>
                <Field label="Previsão de chegada">
                  <input
                    name="arrivalTime"
                    type="time"
                    required
                    min={config.minArrival}
                    max={config.maxArrival}
                    className={inputClass}
                    value={booking.arrivalTime}
                    aria-invalid={!!fields.arrivalTime}
                    aria-describedby="arrival-hint arrivalTime-error"
                    onChange={(e) =>
                      setBooking({ ...booking, arrivalTime: e.target.value })
                    }
                  />
                  <span id="arrival-hint" className="text-sm font-normal">
                    Entre {config.minArrival} e {config.maxArrival}.
                  </span>
                  {fieldError("arrivalTime")}
                </Field>
              </div>
              <details className="mt-4 text-sm">
                <summary className="min-h-12 flex items-center cursor-pointer font-medium">
                  Funcionamento e política de atraso
                </summary>
                <p>
                  A reserva é por dia. O horário informa à equipe quando esperar
                  seu grupo. Rodízio de quarta a sábado.
                </p>
                <p className="mt-2">
                  Após {config.graceMinutes} minutos de atraso, a equipe poderá
                  cancelar por ausência. Se precisar chegar mais tarde, contate
                  a pizzaria.
                </p>
              </details>
            </Card>
            <Card>
              <h3 className="font-semibold mb-3">Onde prefere sentar?</h3>
              <AreaSelector
                value={booking.area}
                onChange={(area) => setBooking({ ...booking, area })}
              />
              {fieldError("area")}
            </Card>
            <Card>
              <RequestState
                loading={availability.loading}
                error={availability.error}
                retry={availability.reload}
              />
              {availability.data && (
                <div className="text-sm" role="status">
                  <p>{availability.data.message}</p>
                  {availability.data.alternatives.length > 0 && (
                    <ul className="list-disc pl-5 mt-2">
                      {availability.data.alternatives.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="mt-3">
                <Button
                  onClick={availability.reload}
                  disabled={availability.loading}
                >
                  Atualizar disponibilidade
                </Button>
              </div>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={() => go("client")}>Voltar ao início</Button>
              <Button
                primary
                type="submit"
                disabled={
                  availability.loading || !!availability.error || unavailable
                }
              >
                Continuar para seus dados
              </Button>
            </div>
          </fieldset>
        ) : (
          <>
            <Card>
              <BookingSummary booking={booking} />
              <div className="mt-4">
                <Button onClick={() => moveStep(1)} disabled={busy}>
                  Alterar visita
                </Button>
              </div>
            </Card>
            <fieldset disabled={busy} className="min-w-0">
              <legend className="sr-only">Dados para contato</legend>
              <Card>
                <div className="grid gap-4">
                  <Field label="Nome">
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      className={inputClass}
                      value={contact.name}
                      aria-invalid={!!fields.name}
                      aria-describedby={fields.name ? "name-error" : undefined}
                      onChange={(e) =>
                        setContact({ ...contact, name: e.target.value })
                      }
                    />
                    {fieldError("name")}
                  </Field>
                  <Field label="Telefone com DDD">
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      maxLength={20}
                      autoComplete="tel-national"
                      placeholder="(48) 99999-0000"
                      className={inputClass}
                      value={contact.phone}
                      aria-invalid={!!fields.phone}
                      aria-describedby="phone-hint phone-error"
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                    />
                    <span id="phone-hint" className="text-sm font-normal">
                      Telefone para contato sobre a reserva. Não enviamos
                      códigos.
                    </span>
                    {fieldError("phone")}
                  </Field>
                  <Field label="Observação" hint="opcional">
                    <textarea
                      name="note"
                      rows={2}
                      maxLength={500}
                      className={inputClass}
                      placeholder="Acessibilidade, cadeira de bebê…"
                      value={booking.note}
                      onChange={(e) =>
                        setBooking({ ...booking, note: e.target.value })
                      }
                    />
                    {fieldError("note")}
                  </Field>
                  <p className="text-sm" style={{ color: colors.muted }}>
                    Nome e telefone serão usados para organizar e entrar em
                    contato sobre sua reserva. Guarde o link exclusivo exibido
                    após confirmar.
                  </p>
                </div>
              </Card>
            </fieldset>
            <Card>
              <p className="text-sm mb-4">
                Confira os dados acima antes de confirmar.
                {demoMode
                  ? " Esta é uma simulação local."
                  : " A confirmação depende da disponibilidade no servidor."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => moveStep(1)} disabled={busy}>
                  Voltar
                </Button>
                <Button
                  primary
                  type="submit"
                  disabled={
                    busy ||
                    availability.loading ||
                    !!availability.error ||
                    unavailable
                  }
                >
                  {busy ? "Confirmando…" : "Confirmar reserva"}
                </Button>
              </div>
            </Card>
          </>
        )}
      </form>
    </>
  );
}
