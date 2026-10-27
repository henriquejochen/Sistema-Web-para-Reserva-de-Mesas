import type { GuestReservation } from "../types/reservation";

// Política demonstrativa, sem divisão da disponibilidade em horários.
export const ARRIVAL_WARNING_MINUTES = 15;
export const ARRIVAL_GRACE_MINUTES = 30;
export const MIN_ARRIVAL_TIME = "19:30";
export const MAX_ARRIVAL_TIME = "21:30";
export const validArrivalTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const isArrivalWithinOpeningHours = (value: string) =>
  validArrivalTime(value) && value >= MIN_ARRIVAL_TIME && value <= MAX_ARRIVAL_TIME;

export function arrivalDelayMinutes(reservation: Pick<GuestReservation, "date" | "arrivalTime">, now = new Date()): number | null {
  if (!validArrivalTime(reservation.arrivalTime)) return null;
  const arrival = new Date(reservation.date + "T" + reservation.arrivalTime + ":00");
  if (!Number.isFinite(arrival.getTime())) return null;
  return Math.floor((now.getTime() - arrival.getTime()) / 60000);
}

export function canReleaseForAbsence(reservation: GuestReservation, now = new Date()): boolean {
  const delay = arrivalDelayMinutes(reservation, now);
  return reservation.status === "Confirmada" && delay !== null && delay >= ARRIVAL_GRACE_MINUTES;
}
