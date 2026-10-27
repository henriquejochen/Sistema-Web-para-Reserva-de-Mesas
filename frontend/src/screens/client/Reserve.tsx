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
import { Icon } from "../../components/ui/Icon";
import { ARRIVAL_GRACE_MINUTES, MIN_ARRIVAL_TIME, MAX_ARRIVAL_TIME } from "../../services/arrivalPolicy";

interface ReserveProps {
  go: (s: Screen) => void; booking: BookingDraft; setBooking: (b: BookingDraft) => void;
  contact: GuestContact; setContact: (c: GuestContact) => void; onConfirm: () => void; error: string;
}
export function Reserve({go, booking, setBooking, contact, setContact, onConfirm, error}: ReserveProps) {
  const date = new Date(booking.date + "T12:00:00");
  const rodizio = [3,4,5,6].includes(date.getDay());
  return <>
    <PageTitle title="Reserve sua mesa" subtitle="Reserve pelo dia e informe a previsão de chegada para organizarmos sua recepção."/>
    <form onSubmit={e=>{e.preventDefault(); onConfirm();}} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-4 min-w-0">
        <Card><h2 className="flex items-center gap-2 mb-4 font-semibold"><Icon name="calendar"/>Qual dia e quantas pessoas?</h2>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Dia da reserva"><input type="date" className={inputClass} min={localDateISO()} required value={booking.date} onChange={e=>setBooking({...booking,date:e.target.value})}/></Field><Field label="Número de pessoas"><GuestDropdown value={booking.guests} onChange={guests=>setBooking({...booking,guests})}/></Field></div>
          <p className="mt-4 text-sm" style={{color: colors.muted}}>Abrimos todos os dias. Rodízio de quarta a sábado.</p>
          {booking.date && <p className="mt-2 text-sm font-medium" style={{color:colors.redDark}}>{rodizio ? "Neste dia também temos rodízio." : "Neste dia o atendimento é à la carte, sem rodízio."}</p>}
        </Card>
        <Card><h2 className="flex items-center gap-2 mb-4 font-semibold"><Icon name="clock"/>A que horas pretende chegar?</h2>
          <label htmlFor="arrival-time" className="block mb-2 text-sm font-medium">Previsão de chegada</label>
          <input id="arrival-time" type="time" required min={MIN_ARRIVAL_TIME} max={MAX_ARRIVAL_TIME} step={60} className={inputClass} value={booking.arrivalTime} onChange={e=>setBooking({...booking,arrivalTime:e.target.value})} aria-describedby="arrival-help arrival-policy"/>
          <p id="arrival-help" className="mt-3 text-sm" style={{color:colors.muted}}>Informe a chegada entre {MIN_ARRIVAL_TIME} e {MAX_ARRIVAL_TIME}. Este horário serve para a equipe saber quando esperar seu grupo. Sua reserva é por dia, sem divisão em faixas de horário.</p>
          <p id="arrival-policy" className="mt-3 rounded-lg p-3 text-sm" style={{background:colors.cream}}>Após {ARRIVAL_GRACE_MINUTES} minutos de atraso, a equipe poderá cancelar a reserva por ausência e disponibilizar a mesa para outro grupo. Se precisar chegar mais tarde, entre em contato com a pizzaria.</p>
        </Card>
        <Card><h2 className="mb-2 font-semibold">Onde prefere sentar?</h2><p className="mb-4 text-sm" style={{color:colors.muted}}>Vamos organizar as mesas de acordo com o tamanho do grupo.</p><AreaSelector value={booking.area} onChange={area=>setBooking({...booking,area})}/></Card>
        <Card><Field label="Observação" hint="opcional"><textarea className={inputClass} rows={3} maxLength={500} placeholder="Cadeira de bebê, acessibilidade ou algo que precisamos saber" value={booking.note} onChange={e=>setBooking({...booking,note:e.target.value})}/></Field></Card>
        <Card><h2 className="mb-2 font-semibold">Seus dados para finalizar</h2><p className="mb-4 text-sm" style={{color:colors.muted}}>Só precisamos do seu nome e de um telefone para contato. Sem cadastro ou senha.</p>
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="guest-name" className="block mb-2 text-sm font-medium">Nome</label><input id="guest-name" required minLength={2} maxLength={80} autoComplete="name" className={inputClass} value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})}/></div><div><label htmlFor="guest-phone" className="block mb-2 text-sm font-medium">Telefone com DDD</label><input id="guest-phone" type="tel" inputMode="tel" required maxLength={20} autoComplete="tel-national" placeholder="(48) 99999-0000" className={inputClass} aria-describedby="phone-help" value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})}/><p id="phone-help" className="mt-2 text-xs">10 ou 11 dígitos, incluindo o DDD. Não enviamos códigos.</p></div></div>
        </Card>
      </div>
      <div className="min-w-0 self-start grid gap-4 lg:sticky lg:top-5"><Card><h2 className="font-semibold mb-4">Confira sua reserva</h2><BookingSummary booking={booking}/><p className="my-4 text-sm">Após confirmar, salve o link exclusivo para consultar ou cancelar esta reserva.</p>{error && <p role="alert" className="mb-4 text-sm" style={{color:colors.redDark}}>{error}</p>}<div className="grid gap-2"><Button primary full type="submit">Confirmar reserva <Icon name="arrow" size={18}/></Button><Button full onClick={()=>go("client")}>Voltar ao início</Button></div></Card><p className="text-xs px-1" style={{color:colors.muted}}>Protótipo: use dados fictícios. Nenhuma reserva é enviada à pizzaria.</p></div>
    </form>
  </>;
}
