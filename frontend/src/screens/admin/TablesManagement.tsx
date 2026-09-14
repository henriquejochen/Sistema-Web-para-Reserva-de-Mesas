import { useState } from "react";
import type { RestaurantTable, TableStatus } from "../../types/table";
import { colors, inputClass, tableStatusPalette } from "../../constants/theme";
import { restaurantTables } from "../../constants/tables";
import { PageTitle } from "../../components/ui/PageTitle";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";

export function TablesManagement() {
  const [selected, setSelected] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<Record<number, TableStatus>>({
    1: "Disponível",
    2: "Reservada",
    3: "Ocupada",
    4: "Disponível",
    5: "Reservada",
    6: "Disponível",
    7: "Disponível",
    8: "Ocupada",
    9: "Reservada",
    10: "Disponível",
    11: "Disponível",
    12: "Reservada",
    13: "Disponível",
    14: "Ocupada",
    15: "Reservada",
    16: "Disponível",
  });
  const [capacities, setCapacities] = useState<Record<number, number>>(
    Object.fromEntries(restaurantTables.map((t) => [t.number, t.capacity]))
  );
  const [editStatus, setEditStatus] = useState<TableStatus>("Disponível");
  const [editCapacity, setEditCapacity] = useState<number>(2);

  const totalCapacity = restaurantTables.reduce((s, t) => s + capacities[t.number], 0);

  const openEdit = (n: number) => {
    setSelected(n);
    setEditStatus(statuses[n]);
    setEditCapacity(capacities[n]);
  };

  const saveEdit = () => {
    if (selected === null) return;
    setStatuses((p) => ({ ...p, [selected]: editStatus }));
    setCapacities((p) => ({ ...p, [selected]: editCapacity }));
    setSelected(null);
  };

  const groups: { label: string; icon: string; tables: RestaurantTable[] }[] = [
    {
      label: "Salão interno",
      icon: "🏠",
      tables: [...restaurantTables.filter((t) => t.area === "interna")].sort((a, b) => a.number - b.number),
    },
    {
      label: "Área externa / Rua",
      icon: "🌿",
      tables: [...restaurantTables.filter((t) => t.area === "externa")].sort((a, b) => a.number - b.number),
    },
  ];

  return (
    <>
      <PageTitle
        title="Gerenciamento de mesas"
        subtitle={`${restaurantTables.length} mesas · ${totalCapacity} lugares`}
        action={<Button primary>+ Cadastrar mesa</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Table list grouped by area */}
        <div className="grid gap-5">
          {groups.map(({ label, icon, tables }) => (
            <Card key={label}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                  <h2 className="font-semibold" style={{ color: colors.ink }}>
                    {label}
                  </h2>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {tables.length} mesas · {tables.reduce((s, t) => s + capacities[t.number], 0)} lugares
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {tables.map((t) => {
                  const status = statuses[t.number];
                  const palette = tableStatusPalette[status];
                  const isActive = selected === t.number;
                  return (
                    <button
                      key={t.number}
                      type="button"
                      onClick={() => (isActive ? setSelected(null) : openEdit(t.number))}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all cursor-pointer"
                      style={{
                        background: isActive ? colors.redLight : "#fff",
                        borderColor: isActive ? colors.red : colors.border,
                        borderWidth: isActive ? 2 : 1,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
                          style={{ background: colors.cream, color: colors.ink }}
                        >
                          {String(t.number).padStart(2, "0")}
                        </span>
                        <span className="text-sm" style={{ color: colors.muted }}>
                          {capacities[t.number]} lugares
                        </span>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          background: palette.bg,
                          color: palette.text,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Edit panel */}
        <div className="self-start grid gap-3">
          {selected !== null ? (
            (() => {
              const t = restaurantTables.find((r) => r.number === selected)!;
              return (
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold" style={{ color: colors.ink }}>
                        Mesa {String(selected).padStart(2, "0")}
                      </h2>
                      <p className="mt-0.5 text-xs" style={{ color: colors.muted }}>
                        {t.area === "externa" ? "🌿 Área externa" : "🏠 Salão interno"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-xl leading-none cursor-pointer"
                      style={{ color: colors.muted }}
                      title="Fechar"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid gap-4">
                    <Field label="Capacidade">
                      <select
                        className={inputClass}
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(Number(e.target.value))}
                      >
                        <option value="2">2 lugares</option>
                        <option value="4">4 lugares</option>
                      </select>
                    </Field>
                    <Field label="Situação">
                      <div className="grid grid-cols-3 gap-2">
                        {(["Disponível", "Reservada", "Ocupada"] as TableStatus[]).map((s) => {
                          const p = tableStatusPalette[s];
                          const active = editStatus === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setEditStatus(s)}
                              className="flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all border text-center cursor-pointer"
                              style={{
                                background: active ? p.bg : "#fff",
                                borderColor: active ? p.border : colors.border,
                                color: active ? p.text : colors.muted,
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <div className="flex gap-2">
                      <Button primary full onClick={saveEdit}>
                        Salvar
                      </Button>
                      <Button full onClick={() => setSelected(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })()
          ) : (
            <div
              className="rounded-xl border p-5 text-center text-sm"
              style={{ borderColor: colors.border, color: colors.muted, borderStyle: "dashed" }}
            >
              Selecione uma mesa para editar.
            </div>
          )}

          {/* Summary */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold" style={{ color: colors.ink }}>
              Resumo
            </h3>
            <div className="grid gap-2">
              {(["Disponível", "Reservada", "Ocupada"] as TableStatus[]).map((s) => {
                const count = restaurantTables.filter((t) => statuses[t.number] === s).length;
                const p = tableStatusPalette[s];
                return (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2" style={{ color: colors.muted }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: p.border }} />
                      {s}
                    </span>
                    <strong style={{ color: colors.ink }}>{count}</strong>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
