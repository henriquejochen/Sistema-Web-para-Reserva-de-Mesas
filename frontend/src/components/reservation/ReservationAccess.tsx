import { useState } from "react";
import type { GuestReservation } from "../../types/reservation";
import { colors, inputClass } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { reservationLink } from "../../services/guestReservations";
export function ReservationAccess({
  reservation,
  onCancel,
  busy = false,
}: {
  reservation: GuestReservation;
  onCancel?: () => Promise<void>;
  busy?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const link = reservationLink(reservation.token);
  return (
    <div className="grid gap-4 text-left">
      <dl className="grid gap-3 text-sm">
        {[
          ["Nome", reservation.name],
          ["Telefone", reservation.phone],
          ["Data", reservation.date.split("-").reverse().join("/")],
          ["Chegada prevista", reservation.arrivalTime || "Não informada"],
          ["Pessoas", String(reservation.guests)],
          [
            "Área",
            areaOptions.find((a) => a.value === reservation.area)?.label ?? "",
          ],
          ...(reservation.tables?.length
            ? [["Mesa(s)", reservation.tables.join(", ")]]
            : []),
          ["Código", reservation.code],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt style={{ color: colors.muted }}>{label}</dt>
            <dd className="text-right break-words min-w-0 font-semibold">
              {value}
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-3">
          <dt>Status</dt>
          <dd>
            <StatusBadge status={reservation.status} />
          </dd>
        </div>
      </dl>
      {reservation.note && (
        <p className="text-sm break-words">Observação: {reservation.note}</p>
      )}
      {reservation.cancellationReason && (
        <p className="text-sm">Motivo: {reservation.cancellationReason}</p>
      )}
      <div
        className="rounded-xl p-4 grid gap-3"
        style={{ background: colors.cream }}
      >
        <label className="text-sm font-semibold" htmlFor="reservation-link">
          Guarde o link da sua reserva
        </label>
        <p className="text-sm">
          Quem tiver este link poderá acessar esta reserva. Compartilhe apenas
          com pessoas de confiança.
        </p>
        <input
          id="reservation-link"
          className={inputClass}
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
        />
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setMessage("Link copiado!");
            } catch {
              setMessage("Selecione o link acima e copie manualmente.");
            }
          }}
        >
          Copiar link exclusivo
        </Button>
      </div>
      {onCancel &&
        reservation.allowedActions?.includes("cancel") &&
        (asking ? (
          <div
            className="grid gap-3"
            role="group"
            aria-label="Confirmar cancelamento"
          >
            <p>Deseja cancelar esta reserva?</p>
            <Button
              disabled={busy}
              danger
              onClick={async () => {
                await onCancel();
                setAsking(false);
              }}
            >
              Sim, cancelar reserva
            </Button>
            <Button disabled={busy} onClick={() => setAsking(false)}>
              Manter reserva
            </Button>
          </div>
        ) : (
          <Button disabled={busy} danger onClick={() => setAsking(true)}>
            Cancelar reserva
          </Button>
        ))}
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
