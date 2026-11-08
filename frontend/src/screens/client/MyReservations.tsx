import { useState } from "react";
import type { Screen } from "../../types/navigation";
import type { GuestReservation } from "../../types/reservation";
import type { Configuration } from "../../services/backend";
import { demoMode } from "../../services/backend";
import { inputClass } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ReservationAccess } from "../../components/reservation/ReservationAccess";
export function MyReservations({
  go,
  reservation,
  openLink,
  onCancel,
  busy,
  error,
  retry,
  config,
}: {
  go: (s: Screen) => void;
  reservation: GuestReservation | null;
  openLink: (link: string) => Promise<void>;
  onCancel: () => Promise<void>;
  busy: boolean;
  error: string;
  retry: () => void;
  config: Configuration;
}) {
  const [link, setLink] = useState("");
  return (
    <>
      <PageTitle
        title="Consultar reserva"
        subtitle="Use o link exclusivo salvo na confirmação."
        action={
          <Button primary disabled={busy} onClick={() => go("reserve")}>
            + Nova reserva
          </Button>
        }
      />
      <div className="max-w-xl mx-auto grid gap-4" aria-busy={busy}>
        {busy && <p role="status">Consultando sua reserva…</p>}
        {error && (
          <div className="rounded-xl border border-red-300 p-4 grid gap-3">
            <p role="alert">{error}</p>
            {location.hash.includes("reserva=") && (
              <Button disabled={busy} onClick={retry}>
                Consultar novamente
              </Button>
            )}
          </div>
        )}
        {reservation && !busy ? (
          <Card>
            <ReservationAccess
              key={reservation.token}
              reservation={reservation}
              onCancel={onCancel}
              busy={busy}
            />
          </Card>
        ) : (
          !busy && (
            <Card>
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void openLink(link);
                }}
              >
                <label htmlFor="access-link" className="font-semibold text-sm">
                  Link da sua reserva
                </label>
                <input
                  id="access-link"
                  type="url"
                  required
                  className={inputClass}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Cole o link que você salvou"
                />
                <Button primary type="submit" disabled={busy}>
                  Consultar reserva
                </Button>
              </form>
            </Card>
          )
        )}
        <p className="text-sm">
          Perdeu o link? Entre em contato com a pizzaria. Nome, telefone e
          código curto não liberam acesso à reserva.
        </p>
        {config.contactPhone && (
          <a
            className="inline-flex items-center min-h-12 underline"
            href={"tel:" + config.contactPhone.replace(/[^+\d]/g, "")}
          >
            Ligar para a pizzaria
          </a>
        )}
        {demoMode && (
          <p className="text-sm">
            Nesta demonstração, o link funciona somente neste navegador. Limpar
            os dados apaga as reservas de teste.
          </p>
        )}
      </div>
    </>
  );
}
