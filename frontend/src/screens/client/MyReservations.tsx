import { useState } from "react";
import type { Screen } from "../../types/navigation";
import type { GuestReservation } from "../../types/reservation";
import { inputClass } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ReservationAccess } from "../../components/reservation/ReservationAccess";

export function MyReservations({ go, reservation, invalidLink, openLink, onCancel, error }: {
  go: (s: Screen) => void; reservation: GuestReservation | null;
  invalidLink: boolean; openLink: (link: string) => boolean; onCancel: () => void; error: string;
}) {
  const [link, setLink] = useState("");
  const [invalid, setInvalid] = useState(false);
  return <>
    <PageTitle title="Consultar reserva" subtitle="Acesse uma reserva usando o link exclusivo recebido na confirmação." action={<Button primary onClick={() => go("reserve")}>+ Nova reserva</Button>}/>
    <div className="max-w-xl mx-auto grid gap-4">
      {(invalidLink || invalid) && <p role="alert">Link inválido ou reserva não encontrada neste navegador. Confira o link e o navegador em que fez a reserva.</p>}
      {error && <p role="alert">{error}</p>}
      {reservation ? <Card><ReservationAccess key={reservation.token} reservation={reservation} onCancel={onCancel}/></Card> : <Card>
        <form className="grid gap-4" onSubmit={e => {e.preventDefault(); setInvalid(!openLink(link));}}>
          <label htmlFor="access-link" className="text-sm font-semibold">Link da sua reserva</label>
          <input id="access-link" type="url" required className={inputClass} value={link} onChange={e => setLink(e.target.value)} placeholder="Cole o link que você salvou"/>
          <Button primary type="submit">Consultar reserva</Button>
        </form>
        <p className="mt-4 text-sm">Perdeu o link? Entre em contato com a pizzaria. Nome, telefone e código de identificação não liberam acesso à reserva.</p>
        <p className="mt-3 text-xs">Protótipo local: links funcionam somente no mesmo navegador e endereço. Limpar os dados do navegador apaga as reservas de teste.</p>
      </Card>}
    </div>
  </>;
}
