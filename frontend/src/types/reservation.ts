export type ReservationStatus = "Confirmada" | "Presente" | "Concluída" | "Cancelada";

export type AreaPreference = "interna" | "externa" | "any";

export type BookingDraft = {
  date: string;
  guests: number;
  area: AreaPreference;
  time: string;
  note: string;
};

export type GuestContact = { name: string; phone: string };
export type GuestReservation = BookingDraft & GuestContact & {
  token: string;
  code: string;
  status: "Confirmada" | "Cancelada";
};
