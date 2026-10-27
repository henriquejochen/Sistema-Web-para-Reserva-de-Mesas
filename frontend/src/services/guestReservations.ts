import { localDateISO } from "../constants/theme";
import type { BookingDraft, GuestContact, GuestReservation, ReservationStatus } from "../types/reservation";
import { canReleaseForAbsence, validArrivalTime, isArrivalWithinOpeningHours } from "./arrivalPolicy";

// Armazenamento apenas para o protótipo. A autorização real pertence ao backend.
const prefix = "di-napoli:prototype:reservation:";
export const RESERVATIONS_CHANGED = "di-napoli:prototype:reservations-changed";
const tokenPattern = /^[a-f0-9]{64}$/;
export const tokenFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get("reserva") ?? "";
export const reservationLink = (token: string) => window.location.href.split("#")[0] + "#reserva=" + token;

export function readReservation(token: string): GuestReservation | null {
  if (!tokenPattern.test(token)) return null;
  try {
    const r = JSON.parse(localStorage.getItem(prefix + token) ?? "null");
    if (!r || r.token !== token || !["Confirmada", "Presente", "Concluída", "Cancelada"].includes(r.status) ||
      ![r.name, r.phone, r.date, r.code, r.note].every(v => typeof v === "string") ||
      !["any", "interna", "externa"].includes(r.area) || !Number.isInteger(r.guests)) return null;
    // Mantém acessíveis os links anteriores à inclusão da previsão de chegada.
    const arrivalTime = r.arrivalTime ?? r.time ?? "";
    if (typeof arrivalTime !== "string" || (arrivalTime !== "" && !validArrivalTime(arrivalTime))) return null;
    return { ...r, arrivalTime };
  } catch { return null; }
}

export function createReservation(booking: BookingDraft, contact: GuestContact): GuestReservation {
  if (!isArrivalWithinOpeningHours(booking.arrivalTime)) throw new Error("Previsão de chegada fora do horário de funcionamento.");
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  const reservation: GuestReservation = { ...booking, name: contact.name.trim(),
    phone: contact.phone.replace(/\D/g, ""), token, code: "#R-" + token.slice(0, 8).toUpperCase(), status: "Confirmada" };
  localStorage.setItem(prefix + token, JSON.stringify(reservation));
  window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
  return reservation;
}

export function cancelReservation(token: string): GuestReservation | null {
  const reservation = readReservation(token);
  if (!reservation || reservation.status !== "Confirmada" || reservation.date < localDateISO()) return null;
  const cancelled: GuestReservation = { ...reservation, status: "Cancelada" };
  localStorage.setItem(prefix + token, JSON.stringify(cancelled));
  window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
  return cancelled;
}

// Visão local da equipe; em produção, estas operações precisam de autorização na API.
export function listReservations(): GuestReservation[] {
  const reservations: GuestReservation[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const reservation = readReservation(key.slice(prefix.length));
    if (reservation) reservations.push(reservation);
  }
  return reservations.sort((a, b) => a.date.localeCompare(b.date) || (a.arrivalTime || "99:99").localeCompare(b.arrivalTime || "99:99"));
}

export function updateStaffReservation(token: string, status: ReservationStatus): GuestReservation | null {
  const reservation = readReservation(token);
  if (!reservation) return null;
  const allowed = reservation.status === "Confirmada" ? ["Presente", "Cancelada"] : reservation.status === "Presente" ? ["Concluída", "Cancelada"] : [];
  if (!allowed.includes(status)) return null;
  const updated = { ...reservation, status };
  localStorage.setItem(prefix + token, JSON.stringify(updated));
  window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
  return updated;
}

export function releaseAbsentReservation(token: string, now = new Date()): GuestReservation | null {
  const reservation = readReservation(token);
  if (!reservation || !canReleaseForAbsence(reservation, now)) return null;
  return updateStaffReservation(token, "Cancelada");
}

export function tokenFromLink(value: string): string {
  try {
    const url = new URL(value.trim());
    if (url.origin !== location.origin || url.pathname !== location.pathname) return "";
    const token = new URLSearchParams(url.hash.slice(1)).get("reserva") ?? "";
    return tokenPattern.test(token) ? token : "";
  } catch { return ""; }
}
