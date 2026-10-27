import type { Screen } from "../../types/navigation";
import { colors, localDateISO } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { usePrototypeReservations } from "../../hooks/usePrototypeReservations";

export function AdminHome({go}: {go:(s:Screen)=>void}) {
  const {reservations,error}=usePrototypeReservations();
  const today=reservations.filter(r=>r.date===localDateISO());
  const waiting=today.filter(r=>r.status==="Confirmada");
  const stats=[{label:"Reservas hoje",value:today.filter(r=>r.status!=="Cancelada").length},{label:"Aguardando chegada",value:waiting.length},{label:"Grupos presentes",value:today.filter(r=>r.status==="Presente").length}];
  return <>
    <PageTitle title="Painel da equipe" subtitle={new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} action={<Button onClick={()=>go("tables")}>Gerenciar mesas</Button>}/>
    {error&&<p role="alert" className="mb-4">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{stats.map(s=><Card key={s.label}><p className="text-sm" style={{color:colors.muted}}>{s.label}</p><strong className="mt-2 block text-3xl">{s.value}</strong></Card>)}</div>
    <div className="grid gap-4 mt-4 md:grid-cols-2"><Card><h2 className="font-semibold">Chegadas previstas para hoje</h2><div className="mt-4 grid gap-4">{waiting.length===0&&<p className="text-sm" style={{color:colors.muted}}>Nenhum grupo aguardando chegada.</p>}{waiting.slice(0,5).map(r=><div key={r.token} className="flex items-start gap-3"><Icon name="clock" size={20} className="shrink-0 mt-1"/><div className="min-w-0"><strong className="text-sm break-words">{r.arrivalTime || "Sem previsão"} · {r.name}</strong><p className="mt-1 text-xs" style={{color:colors.muted}}>{r.guests} pessoas · {areaOptions.find(a=>a.value===r.area)?.label}</p></div></div>)}</div><div className="mt-5"><Button primary full onClick={()=>go("daily")}>Ver reservas e atrasos</Button></div></Card><Card><h2 className="font-semibold">Acesso rápido</h2><div className="mt-4 grid gap-3"><Button full onClick={()=>go("daily")}><Icon name="calendar" size={18}/>Reservas por dia</Button><Button full onClick={()=>go("tables")}><Icon name="table" size={18}/>Gerenciar mesas</Button></div><p className="mt-5 text-xs" style={{color:colors.muted}}>Dados de teste deste navegador. A reserva continua vinculada ao dia; a previsão de chegada ajuda a organizar a recepção.</p></Card></div>
  </>;
}
