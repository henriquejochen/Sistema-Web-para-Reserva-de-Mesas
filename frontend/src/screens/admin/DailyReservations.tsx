import { useCallback, useEffect, useRef, useState } from "react";
import type { GuestReservation } from "../../types/reservation";
import { backend, ApiError, errorMessage } from "../../services/backend";
import type { Configuration } from "../../services/backend";
import { colors, inputClass, localDateISO } from "../../constants/theme";
import { useResource } from "../../hooks/useResource";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { RequestState } from "../../components/ui/RequestState";
export function DailyReservations({ config }: { config: Configuration }) {
  const [date, setDate] = useState(localDateISO);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [arrival, setArrival] = useState("");
  const [page, setPage] = useState(1);
  const load = useCallback(() => backend.reservations(date), [date]);
  const resource = useResource(load);
  const [pending, setPending] = useState<{
    reservation: GuestReservation;
    action: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    const timer = window.setInterval(resource.reload, 30000);
    return () => window.clearInterval(timer);
  }, [resource.reload]);
  const rows = (resource.data ?? [])
    .filter(
      (r) =>
        (!status || r.status === status) &&
        (!arrival || r.arrivalTime === arrival) &&
        (r.name + " " + r.phone + " " + r.code)
          .toLocaleLowerCase("pt-BR")
          .includes(search.trim().toLocaleLowerCase("pt-BR")),
    )
    .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const currentPage = Math.min(page, pages);
  const update = async (reservation: GuestReservation, action: string) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await backend.updateReservation(reservation.token, action);
      setMessage("Situação da reserva atualizada.");
      setPending(null);
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError && e.status === 401)
        window.dispatchEvent(new Event("staff-session-expired"));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Reservas do dia"
        subtitle="Acompanhe as chegadas e a situação dos grupos."
        action={
          <Button onClick={resource.reload} disabled={busy || resource.loading}>
            Atualizar lista
          </Button>
        }
      />
      <Card className="mb-4">
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2 min-w-0">
          <legend className="sr-only">Filtros de reservas</legend>
          <div>
            <label htmlFor="staff-date" className="block text-sm mb-2">
              Dia das reservas
            </label>
            <input
              id="staff-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => {
                if (e.target.value) {
                  setDate(e.target.value);
                  setPending(null);
                  setPage(1);
                }
              }}
            />
          </div>
          <div>
            <label htmlFor="staff-search" className="block text-sm mb-2">
              Buscar cliente
            </label>
            <input
              id="staff-search"
              type="search"
              className={inputClass}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Nome, telefone ou código"
            />
          </div>
          <div>
            <label htmlFor="staff-status" className="block text-sm mb-2">
              Status
            </label>
            <select
              id="staff-status"
              className={inputClass}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {["Confirmada", "Presente", "Concluída", "Cancelada"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="staff-arrival" className="block text-sm mb-2">
              Previsão de chegada
            </label>
            <input
              id="staff-arrival"
              type="time"
              className={inputClass}
              value={arrival}
              onChange={(e) => {
                setArrival(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            onClick={() => {
              setSearch("");
              setStatus("");
              setArrival("");
              setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        </fieldset>
        <p className="mt-4 text-sm">
          Alerta após {config.warningMinutes} min; liberação por ausência após{" "}
          {config.graceMinutes} min, mediante confirmação e autorização do
          servidor.
        </p>
      </Card>
      <RequestState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {error && (
        <p role="alert" className="mb-4 text-red-800">
          {error}
        </p>
      )}
      <p role="status" className="mb-4 text-sm">
        {message ||
          (!resource.loading && !resource.error
            ? `${rows.length} reserva(s) encontrada(s)`
            : "")}
      </p>
      <div className="grid gap-4">
        {!resource.loading && !resource.error && rows.length === 0 && (
          <Card>
            <h2 className="font-semibold">Nenhuma reserva encontrada</h2>
            <p className="mt-2 text-sm">
              Escolha outra data ou ajuste os filtros.
            </p>
          </Card>
        )}
        {rows.slice((currentPage - 1) * 10, currentPage * 10).map((r) => (
          <Card key={r.token}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-semibold break-words min-w-0">{r.name}</h2>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-3 text-sm">
              {r.guests} pessoas · Chegada: {r.arrivalTime || "não informada"}
            </p>
            <p className="mt-2 text-sm break-words">
              {r.phone} · {r.code}
              {r.tables?.length ? ` · Mesa(s): ${r.tables.join(", ")}` : ""}
            </p>
            {r.note && (
              <p className="mt-3 text-sm break-words">Observação: {r.note}</p>
            )}
            {r.cancellationReason && (
              <p className="mt-3 text-sm">Motivo: {r.cancellationReason}</p>
            )}
            {r.late && (
              <p
                className="mt-3 rounded-xl p-3 text-sm"
                style={{ background: colors.redLight }}
              >
                {r.delayMinutes} min de atraso. Confira se o grupo avisou a
                equipe.
              </p>
            )}
            {pending?.reservation.token === r.token ? (
              <div
                className="mt-4 grid gap-3 rounded-xl border p-4"
                role="group"
                aria-label="Confirmar cancelamento"
              >
                <p className="text-sm">
                  {pending.action === "release"
                    ? "Confirmar ausência do grupo e liberar a reserva?"
                    : "Deseja cancelar esta reserva?"}
                </p>
                <Button
                  disabled={busy}
                  danger
                  onClick={() => update(r, pending.action)}
                >
                  {busy ? "Atualizando…" : "Confirmar cancelamento"}
                </Button>
                <Button disabled={busy} onClick={() => setPending(null)}>
                  Manter reserva
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
                {r.allowedActions?.includes("arrive") && (
                  <Button
                    disabled={busy}
                    primary
                    onClick={() => update(r, "arrive")}
                  >
                    Confirmar chegada
                  </Button>
                )}
                {r.allowedActions?.includes("complete") && (
                  <Button
                    disabled={busy}
                    primary
                    onClick={() => update(r, "complete")}
                  >
                    Concluir atendimento
                  </Button>
                )}
                {r.allowedActions?.includes("release") && (
                  <Button
                    disabled={busy}
                    danger
                    onClick={() =>
                      setPending({ reservation: r, action: "release" })
                    }
                  >
                    Liberar por ausência
                  </Button>
                )}
                {r.allowedActions?.includes("cancel") && (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      setPending({ reservation: r, action: "cancel" })
                    }
                  >
                    Cancelar reserva
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
      {pages > 1 && (
        <nav
          aria-label="Páginas de reservas"
          className="mt-5 flex flex-wrap gap-3 items-center"
        >
          <Button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {pages}
          </span>
          <Button
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </nav>
      )}
    </>
  );
}
