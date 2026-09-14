export type ReservationStatus = "Confirmada" | "Presente" | "Concluída" | "Cancelada";

export type AreaPreference = "interna" | "externa" | "any";

export type BookingDraft = {
  date: string;
  guests: number;
  area: AreaPreference;
  time: string;
  note: string;
};
