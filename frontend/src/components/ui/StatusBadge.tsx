import type { ReservationStatus } from "../../types/reservation";
import { colors } from "../../constants/theme";

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<ReservationStatus, string> = {
    Confirmada: colors.green,
    Presente: colors.amber,
    Concluída: colors.muted,
    Cancelada: colors.red,
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: map[status] }}>
      <span className="h-2 w-2 rounded-full" style={{ background: map[status] }} />
      {status}
    </span>
  );
}
