import type { BookingDraft, GuestContact, GuestReservation } from "../types/reservation";

// Armazenamento apenas para o protótipo. A autorização real pertence ao backend.
const prefix = "di-napoli:prototype:reservation:";
const tokenPattern = /^[a-f0-9]{64}$/;
export const tokenFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get("reserva") ?? "";
export const reservationLink = (token: string) => window.location.href.split("#")[0] + "#reserva=" + token;

export function readReservation(token: string): GuestReservation | null {
  if (!tokenPattern.test(token)) return null;
  try {
    const r = JSON.parse(localStorage.getItem(prefix + token) ?? "null");
    if (!r || r.token !== token || !["Confirmada", "Cancelada"].includes(r.status) ||
      ![r.name, r.phone, r.date, r.time, r.code, r.note].every(v => typeof v === "string") ||
      !["any", "interna", "externa"].includes(r.area) || !Number.isInteger(r.guests)) return null;
    return r;
  } catch { return null; }
}

export function createReservation(booking: BookingDraft, contact: GuestContact): GuestReservation {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  const reservation: GuestReservation = { ...booking, name: contact.name.trim(),
    phone: contact.phone.replace(/\D/g, ""), token, code: "#R-" + token.slice(0, 8).toUpperCase(), status: "Confirmada" };
  localStorage.setItem(prefix + token, JSON.stringify(reservation));
  return reservation;
}

export function cancelReservation(token: string): GuestReservation | null {
  const reservation = readReservation(token);
  if (!reservation || new Date(reservation.date + "T" + reservation.time) <= new Date()) return null;
  const cancelled: GuestReservation = { ...reservation, status: "Cancelada" };
  localStorage.setItem(prefix + token, JSON.stringify(cancelled));
  return cancelled;
}

export function tokenFromLink(value: string): string {
  try {
    const url = new URL(value.trim());
    if (url.origin !== location.origin || url.pathname !== location.pathname) return "";
    const token = new URLSearchParams(url.hash.slice(1)).get("reserva") ?? "";
    return tokenPattern.test(token) ? token : "";
  } catch { return ""; }
}
