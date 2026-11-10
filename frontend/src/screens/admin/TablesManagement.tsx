import { useCallback, useRef, useState } from "react";
import {
  backend,
  ApiError,
  demoMode,
  errorMessage,
} from "../../services/backend";
import type { ManagedTable } from "../../services/backend";
import { useResource } from "../../hooks/useResource";
import { colors, inputClass } from "../../constants/theme";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { RequestState } from "../../components/ui/RequestState";
const blank = {
  number: 1,
  capacity: 2,
  area: "interna" as const,
  active: true,
  status: "Disponível" as const,
};
type Draft = Omit<ManagedTable, "id"> & { id?: number };
export function TablesManagement() {
  const load = useCallback(() => backend.tables(), []);
  const resource = useResource(load);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showInactive, setShowInactive] = useState(false);
  const editor = useRef<HTMLHeadingElement>(null);
  const lock = useRef(false);
  const tables = resource.data ?? [];
  const edit = (table: Draft) => {
    setDraft({ ...table });
    setError("");
    setFieldErrors({});
    setMessage("");
    requestAnimationFrame(() => {
      editor.current?.focus();
      editor.current?.scrollIntoView({ block: "center" });
    });
  };
  const save = async () => {
    if (!draft || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      await backend.saveTable(draft);
      setMessage("Mesa salva com sucesso.");
      setDraft(null);
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError) {
        setFieldErrors(e.fields);
        if (e.status === 401)
          window.dispatchEvent(new Event("staff-session-expired"));
      }
      requestAnimationFrame(() => {
        editor.current?.focus();
        editor.current?.scrollIntoView({ block: "center" });
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Gerenciamento de mesas"
        subtitle={`${tables.length} mesas · ${tables.filter((t) => t.active).reduce((sum, t) => sum + t.capacity, 0)} lugares ativos`}
        action={
          <Button
            primary
            disabled={busy}
            onClick={() =>
              edit({
                ...blank,
                number: Math.max(0, ...tables.map((t) => t.number)) + 1,
              })
            }
          >
            + Cadastrar mesa
          </Button>
        }
      />
      <RequestState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      <p role="status" className="mb-4 text-sm">
        {message}
      </p>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 min-w-0">
          <label className="flex items-center min-h-12 gap-3 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-5 w-5"
            />
            Mostrar mesas inativas
          </label>
          {(["interna", "externa"] as const).map((area) => (
            <Card key={area}>
              <h2 className="font-semibold mb-4">
                {area === "interna" ? "Salão interno" : "Área externa"}
              </h2>
              <div className="grid gap-3">
                {tables
                  .filter((t) => t.area === area && (showInactive || t.active))
                  .sort((a, b) => a.number - b.number)
                  .map((t) => (
                    <button
                      disabled={busy}
                      key={t.id}
                      onClick={() => edit(t)}
                      type="button"
                      className="flex flex-wrap gap-3 items-center justify-between rounded-xl border p-4 min-h-16 text-left"
                      style={{
                        borderColor:
                          draft?.id === t.id ? colors.red : colors.border,
                      }}
                    >
                      <span className="font-semibold">
                        Mesa {String(t.number).padStart(2, "0")}
                        <span className="block mt-1 text-sm font-normal">
                          {t.capacity} lugares
                        </span>
                      </span>
                      <span className="text-sm">
                        {t.active ? t.status : "Inativa"}
                      </span>
                    </button>
                  ))}
                {!resource.loading &&
                  !tables.some(
                    (t) => t.area === area && (showInactive || t.active),
                  ) && <p className="text-sm">Nenhuma mesa nesta área.</p>}
              </div>
            </Card>
          ))}
        </div>
        {draft && (
          <div className="order-first xl:order-last min-w-0 self-start">
            <Card>
              <div className="flex gap-3 items-center justify-between mb-4">
                <h2
                  ref={editor}
                  tabIndex={-1}
                  className="font-semibold text-lg"
                >
                  {draft.id ? "Editar mesa" : "Cadastrar mesa"}
                </h2>
                <button
                  type="button"
                  aria-label="Fechar edição"
                  disabled={busy}
                  className="min-h-12 min-w-12 rounded-lg border text-xl"
                  onClick={() => setDraft(null)}
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
                aria-busy={busy}
              >
                <fieldset disabled={busy} className="grid gap-4 min-w-0">
                  <legend className="sr-only">Dados da mesa</legend>
                  {error && (
                    <p role="alert" className="text-sm text-red-800">
                      {error}
                    </p>
                  )}
                  <Field label="Identificação da mesa">
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      className={inputClass}
                      value={draft.number}
                      aria-invalid={!!fieldErrors.number}
                      onChange={(e) =>
                        setDraft({ ...draft, number: Number(e.target.value) })
                      }
                    />
                    {fieldErrors.number && (
                      <span className="text-sm text-red-800">
                        {fieldErrors.number}
                      </span>
                    )}
                  </Field>
                  <Field label="Capacidade">
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      className={inputClass}
                      value={draft.capacity}
                      onChange={(e) =>
                        setDraft({ ...draft, capacity: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Área">
                    <select
                      className={inputClass}
                      value={draft.area}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          area: e.target.value as ManagedTable["area"],
                        })
                      }
                    >
                      <option value="interna">Salão interno</option>
                      <option value="externa">Área externa</option>
                    </select>
                  </Field>
                  <Field label="Situação">
                    <select
                      className={inputClass}
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          status: e.target.value as ManagedTable["status"],
                        })
                      }
                    >
                      {["Disponível", "Reservada", "Ocupada"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <label className="flex items-center min-h-12 gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={draft.active}
                      onChange={(e) =>
                        setDraft({ ...draft, active: e.target.checked })
                      }
                    />
                    Mesa ativa para novas reservas
                  </label>
                  {!draft.active && (
                    <p className="text-sm">
                      A inativação deve preservar o histórico. O servidor
                      verificará reservas vinculadas antes de salvar.
                    </p>
                  )}
                  <Button primary type="submit" disabled={busy}>
                    {busy ? "Salvando…" : "Salvar mesa"}
                  </Button>
                  <Button disabled={busy} onClick={() => setDraft(null)}>
                    Cancelar edição
                  </Button>
                </fieldset>
              </form>
            </Card>
          </div>
        )}
      </div>
      {demoMode && (
        <p className="mt-5 text-sm">
          Mesas demonstrativas salvas neste navegador. A ocupação não é
          vinculada às reservas neste modo.
        </p>
      )}
    </>
  );
}
