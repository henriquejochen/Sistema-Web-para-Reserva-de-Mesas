import type { RestaurantTable, TableStatus } from "../../types/table";
import { tableStatusPalette } from "../../constants/theme";

interface TableIconProps {
  table: RestaurantTable;
  status: TableStatus;
  selected: boolean;
  onClick: () => void;
  positioned?: boolean;
}

export function TableIcon({
  table,
  status,
  selected,
  onClick,
  positioned = false,
}: TableIconProps) {
  const palette = tableStatusPalette[status];
  const is4pax = table.capacity === 4;
  const isDisabled = status !== "Disponível";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled && !selected}
      title={`Mesa ${table.number} · ${table.capacity}p · ${status}`}
      aria-label={`Mesa ${table.number}, ${table.capacity} lugares, ${status}${
        selected ? ", selecionada" : ""
      }`}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border transition-all duration-150"
      style={{
        minHeight: is4pax ? 60 : 56,
        minWidth: is4pax ? 104 : 56,
        padding: "10px 12px",
        gap: 2,
        background: selected ? palette.bg : "#FFFFFF",
        borderColor: selected ? palette.border : `${palette.border}88`,
        borderWidth: selected ? 2 : 1.5,
        color: palette.text,
        boxShadow: selected ? `0 0 0 3px ${palette.border}33` : "0 1px 3px rgba(0,0,0,0.07)",
        cursor: isDisabled ? "default" : "pointer",
        opacity: isDisabled && status === "Ocupada" ? 0.65 : 1,
        gridColumn: positioned ? table.column : undefined,
        gridRow: positioned ? table.row : undefined,
      }}
    >
      <span style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1, color: palette.text }}>
        {String(table.number).padStart(2, "0")}
      </span>
      <span style={{ fontSize: "0.65rem", fontWeight: 500, color: `${palette.text}99`, lineHeight: 1 }}>
        {table.capacity}p
      </span>
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: palette.border,
          opacity: selected ? 1 : 0.6,
          borderRadius: "0 0 10px 10px",
        }}
      />
    </button>
  );
}
