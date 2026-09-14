import type { BookingDraft } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";

interface BookingSummaryProps {
  booking: BookingDraft;
}

export function BookingSummary({ booking }: BookingSummaryProps) {
  const areaLabel = areaOptions.find((a) => a.value === booking.area);
  const formatted = booking.date
    ? new Date(booking.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";

  return (
    <div className="grid gap-2.5 text-sm">
      {[
        { label: "Data", value: formatted || "—" },
        { label: "Pessoas", value: `${booking.guests} ${booking.guests === 1 ? "pessoa" : "pessoas"}` },
        { label: "Área", value: areaLabel ? `${areaLabel.icon} ${areaLabel.label}` : "—" },
        ...(booking.time ? [{ label: "Horário", value: booking.time }] : []),
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <span style={{ color: colors.muted }}>{label}</span>
          <strong style={{ color: colors.ink }}>{value}</strong>
        </div>
      ))}
    </div>
  );
}
