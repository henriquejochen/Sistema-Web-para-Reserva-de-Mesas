import type { TableStatus } from "../types/table";
import type { BookingDraft } from "../types/reservation";

export const colors = {
  red: "#B82020",
  redDark: "#8B0000",
  redLight: "#FDECEA",
  cream: "#FFF8F3",
  paper: "#FFFCFA",
  ink: "#1C1C1C",
  muted: "#6B6B6B",
  border: "#E5D8D8",
  green: "#2E7D4F",
  greenLight: "#E6F4EC",
  amber: "#B45309",
};

export const tableStatusPalette: Record<TableStatus, { bg: string; border: string; text: string }> = {
  "Disponível": { bg: "#DCFCE7", border: "#22A35A", text: "#166534" },
  "Reservada": { bg: "#FEF3C7", border: "#D97706", text: "#92400E" },
  "Ocupada": { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" },
};

export const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#A6422D] focus:ring-2 focus:ring-[#A6422D22]";

export const todayISO = new Date().toISOString().split("T")[0];

export const defaultBooking: BookingDraft = {
  date: todayISO,
  guests: 2,
  area: "any",
  time: "",
  note: "",
};
