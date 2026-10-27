import type { Screen } from "../../types/navigation";
import { colors } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Icon } from "../../components/ui/Icon";
export function ClientHome({go}: {go: (s: Screen)=>void}) {
  return <div className="max-w-4xl mx-auto">
    <div className="mb-7"><p className="text-xs uppercase tracking-widest mb-3" style={{color:colors.red}}>Sua próxima visita começa aqui</p><h1 className="text-3xl sm:text-4xl font-brand leading-tight">Bem-vindo à Pizzaria Di Napoli</h1><p className="mt-4 text-base" style={{color:colors.muted}}>Reserve uma mesa para reunir quem você gosta. Sem criar conta e sem lembrar senha.</p></div>
    <Card className="mb-4"><div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><Icon name="table" size={30}/><h2 className="mt-3 text-xl font-semibold">Uma mesa para o seu grupo</h2><p className="mt-2 text-sm" style={{color:colors.muted}}>Escolha o dia, a quantidade de pessoas e sua área preferida.</p></div><Button primary onClick={()=>go("reserve")}>Reservar mesa <Icon name="arrow" size={18}/></Button></div></Card>
    <div className="grid gap-4 sm:grid-cols-2"><Card><Icon name="calendar"/><h2 className="mt-3 font-semibold">Aberto todos os dias</h2><p className="mt-2 text-sm" style={{color:colors.muted}}>Reservas de segunda a domingo. Rodízio de quarta a sábado.</p></Card><Card><Icon name="search"/><h2 className="mt-3 font-semibold">Já fez sua reserva?</h2><p className="mt-2 mb-4 text-sm" style={{color:colors.muted}}>Use o link salvo na confirmação para consultar ou cancelar.</p><Button full onClick={()=>go("my-reservations")}>Consultar reserva</Button></Card></div>
  </div>;
}
