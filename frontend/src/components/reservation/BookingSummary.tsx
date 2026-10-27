import type { BookingDraft } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";
export function BookingSummary({booking}: {booking: BookingDraft}) {
  const formatted = booking.date ? new Date(booking.date + "T12:00:00").toLocaleDateString("pt-BR", {weekday: "short", day: "numeric", month: "short"}) : "Selecione uma data";
  return <dl className="grid gap-3 text-sm">{[["Dia", formatted], ["Chegada prevista", booking.arrivalTime || "Informe o horário"], ["Pessoas", String(booking.guests)], ["Área", areaOptions.find(a=>a.value===booking.area)?.label ?? "Sem preferência"]].map(([label,value])=><div key={label} className="flex justify-between gap-3"><dt style={{color:colors.muted}}>{label}</dt><dd className="font-semibold text-right">{value}</dd></div>)}</dl>;
}
