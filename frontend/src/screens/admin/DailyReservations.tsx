import { useEffect, useState } from "react";
import type { GuestReservation, ReservationStatus } from "../../types/reservation";
import { colors, inputClass, localDateISO } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Icon } from "../../components/ui/Icon";
import { usePrototypeReservations } from "../../hooks/usePrototypeReservations";
import { releaseAbsentReservation, updateStaffReservation } from "../../services/guestReservations";
import { ARRIVAL_GRACE_MINUTES, ARRIVAL_WARNING_MINUTES, arrivalDelayMinutes, canReleaseForAbsence } from "../../services/arrivalPolicy";

export function DailyReservations() {
  const { reservations, error } = usePrototypeReservations();
  const [date, setDate] = useState(localDateISO);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [pending, setPending] = useState<{token:string; absence:boolean} | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer);}, []);
  const rows = reservations.filter(r => r.date === date && (r.name + " " + r.phone + " " + r.code).toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  const update = (r: GuestReservation, status: ReservationStatus, absence = false) => {
    try {
      const changed = absence ? releaseAbsentReservation(r.token) : updateStaffReservation(r.token, status);
      setMessage(changed ? (absence ? "Reserva cancelada por ausência. A equipe pode realocar a mesa." : "Situação da reserva atualizada.") : "A ação não está mais disponível. Confira o status e a previsão de chegada.");
    } catch {setMessage("Não foi possível salvar a alteração neste navegador.");}
    setPending(null);
  };
  return <>
    <PageTitle title="Reservas do dia" subtitle="Acompanhe a previsão de chegada e confirme a presença de cada grupo."/>
    <Card className="mb-4"><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="staff-date" className="block text-sm mb-2 font-medium">Dia das reservas</label><input id="staff-date" type="date" className={inputClass} value={date} onChange={e=>{setDate(e.target.value);setPending(null);}}/></div><div><label htmlFor="staff-search" className="block text-sm mb-2 font-medium">Buscar cliente</label><input id="staff-search" type="search" className={inputClass} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome, telefone ou código"/></div></div>
      <div className="mt-4 flex flex-wrap gap-3 items-center text-sm"><span className="inline-flex items-center gap-2"><Icon name="clock" size={18}/>Agora: {now.toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</span><span>{rows.length} {rows.length === 1 ? "reserva encontrada" : "reservas encontradas"}</span></div>
      <p className="mt-3 text-xs" style={{color:colors.muted}}>Alerta após {ARRIVAL_WARNING_MINUTES} minutos. Após {ARRIVAL_GRACE_MINUTES} minutos de atraso, a equipe pode liberar a reserva por ausência. A ação exige confirmação; nada é cancelado automaticamente.</p>
    </Card>
    {error && <p role="alert" className="mb-4">{error}</p>}
    <p role="status" className="mb-4 text-sm">{message}</p>
    <div className="grid gap-4">
      {rows.length === 0 && <Card><h2 className="font-semibold">Nenhuma reserva encontrada</h2><p className="mt-2 text-sm">Escolha outra data ou crie uma reserva de teste no site do cliente, usando este mesmo navegador e endereço.</p></Card>}
      {rows.map(r => {
        const delay = arrivalDelayMinutes(r, now);
        const late = r.status === "Confirmada" && delay !== null && delay >= ARRIVAL_WARNING_MINUTES;
        const releasable = canReleaseForAbsence(r, now);
        return <Card key={r.token}>
          <div className="flex flex-wrap gap-3 items-start justify-between"><div className="min-w-0"><h2 className="font-semibold break-words">{r.name}</h2><p className="mt-1 text-sm" style={{color:colors.muted}}>{r.guests} pessoas · {areaOptions.find(a=>a.value===r.area)?.label} · {r.code}</p></div><StatusBadge status={r.status}/></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm"><p className="flex items-center gap-2"><Icon name="clock" size={18}/><strong>Chegada: {r.arrivalTime || "não informada"}</strong></p><p>Contato: {r.phone}</p></div>
          {r.note && <p className="mt-3 text-sm break-words">Observação: {r.note}</p>}
          {late && <p className="mt-3 flex items-start gap-2 rounded-lg p-3 text-sm" style={{background:releasable?colors.redLight:"#FFF4DC",color:releasable?colors.redDark:colors.amber}}><Icon name="alert" size={18} className="shrink-0 mt-0.5"/>{delay} min de atraso. {releasable ? "A reserva pode ser liberada por ausência após confirmação da equipe." : "Verifique se o cliente avisou sobre o atraso."}</p>}
          {pending?.token === r.token ? <div className="mt-4 grid gap-3 rounded-lg border p-4" style={{borderColor:colors.border}} role="group" aria-label="Confirmar cancelamento da reserva"><p className="text-sm">{pending.absence ? "O grupo ainda não chegou? Confirmar cancela a reserva por ausência e permite realocar a mesa." : "Deseja cancelar esta reserva?"}</p><div className="grid gap-2 sm:grid-cols-2"><Button danger onClick={()=>update(r,"Cancelada",pending.absence)}>Confirmar cancelamento</Button><Button onClick={()=>setPending(null)}>Manter reserva</Button></div></div> : <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            {r.status === "Confirmada" && <Button primary onClick={()=>update(r,"Presente")}><Icon name="check" size={18}/>Confirmar chegada</Button>}
            {r.status === "Presente" && <Button primary onClick={()=>update(r,"Concluída")}>Concluir atendimento</Button>}
            {releasable && <Button danger onClick={()=>setPending({token:r.token,absence:true})}>Liberar por ausência</Button>}
            {(r.status === "Confirmada" || r.status === "Presente") && <Button onClick={()=>setPending({token:r.token,absence:false})}>Cancelar reserva</Button>}
          </div>}
        </Card>;
      })}
    </div>
    <p className="mt-5 text-xs" style={{color:colors.muted}}>Protótipo local: reservas deste navegador. A alocação física e os estados das mesas continuam demonstrativos.</p>
  </>;
}
