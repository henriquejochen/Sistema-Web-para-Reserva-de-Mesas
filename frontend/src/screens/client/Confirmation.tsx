import { Icon } from "../../components/ui/Icon";
import type { Screen } from "../../types/navigation";
import type { GuestReservation } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ReservationAccess } from "../../components/reservation/ReservationAccess";

export function Confirmation({ go, reservation }: {go: (s: Screen) => void; reservation: GuestReservation}) {
  return <div className="mx-auto mt-4 max-w-xl"><Card>
    <div className="text-center mb-6"><div className="text-4xl" style={{color: colors.green}}><Icon name="check" size={36} className="mx-auto"/></div><h1 className="mt-3 text-2xl font-semibold">Reserva confirmada!</h1><p className="mt-2 text-sm">Você não precisa de conta ou senha. Salve seu link para consultar ou cancelar.</p></div>
    <ReservationAccess reservation={reservation}/>
    <div className="mt-5 grid gap-2"><Button primary full onClick={() => go("my-reservations")}>Consultar esta reserva</Button><Button full onClick={() => go("client")}>Voltar ao início</Button></div>
  </Card></div>;
}
