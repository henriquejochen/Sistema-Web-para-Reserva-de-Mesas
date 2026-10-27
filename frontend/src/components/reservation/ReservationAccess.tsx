import { useState } from "react";
import type { GuestReservation } from "../../types/reservation";
import { colors, inputClass } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { reservationLink } from "../../services/guestReservations";

export function ReservationAccess({ reservation, onCancel }: {
  reservation: GuestReservation; onCancel?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const link = reservationLink(reservation.token);
  const future = new Date(reservation.date + "T" + reservation.time) > new Date();
  return <div className="grid gap-4 text-left">
    <dl className="grid gap-2 text-sm">
      {[["Nome", reservation.name], ["Telefone", reservation.phone],
        ["Data", reservation.date.split("-").reverse().join("/")], ["Horário", reservation.time],
        ["Pessoas", String(reservation.guests)], ["Área", areaOptions.find(a => a.value === reservation.area)?.label ?? ""],
        ["Código", reservation.code]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt style={{color: colors.muted}}>{label}</dt><dd className="text-right break-words min-w-0 font-semibold">{value}</dd></div>)}
      <div className="flex justify-between"><dt>Status</dt><dd><StatusBadge status={reservation.status}/></dd></div>
    </dl>
    {reservation.note && <p className="text-sm break-words">Observação: {reservation.note}</p>}
    <div className="rounded-xl p-4 grid gap-3" style={{background: colors.cream}}>
      <label className="text-sm font-semibold" htmlFor="reservation-link">Salve o link da sua reserva</label>
      <p className="text-xs">Quem tiver este link poderá consultar e cancelar esta reserva. Guarde-o em um lugar seguro.</p>
      <input id="reservation-link" className={inputClass} readOnly value={link} onFocus={e => e.target.select()}/>
      <Button onClick={async () => {try {await navigator.clipboard.writeText(link); setMessage("Link copiado!");} catch {setMessage("Selecione o link acima e copie manualmente.");}}}>Copiar link exclusivo</Button>
      <p className="text-xs">Demonstração: funciona apenas neste navegador e endereço. Use dados fictícios. Não enviamos SMS, WhatsApp ou e-mail.</p>
    </div>
    {onCancel && reservation.status === "Confirmada" && future && (asking ? <div className="grid gap-2" role="group" aria-label="Confirmar cancelamento"><p>Deseja cancelar esta reserva?</p><Button danger onClick={() => {onCancel(); setAsking(false);}}>Sim, cancelar reserva</Button><Button onClick={() => setAsking(false)}>Manter reserva</Button></div> : <Button danger onClick={() => setAsking(true)}>Cancelar reserva</Button>)}
    {reservation.status === "Confirmada" && !future && <p className="text-sm">O horário desta reserva já passou. Cancelamento indisponível.</p>}
    <p role="status" className="text-sm">{message}</p>
  </div>;
}
