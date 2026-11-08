import type {
  BookingDraft,
  GuestContact,
  GuestReservation,
  ReservationStatus,
} from "../types/reservation";
import { restaurantTables } from "../constants/tables";
import * as prototype from "./guestReservations";
import { arrivalDelayMinutes, canReleaseForAbsence } from "./arrivalPolicy";

const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
export const demoMode = !base;
export type FieldErrors = Record<string, string>;
export class ApiError extends Error {
  status: number;
  fields: FieldErrors;
  constructor(message: string, status = 0, fields: FieldErrors = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Não foi possível concluir a operação.";
export interface Configuration {
  minArrival: string;
  maxArrival: string;
  maxGuests: number;
  graceMinutes: number;
  warningMinutes: number;
  contactPhone: string | null;
}
export interface ManagedTable {
  id: number;
  number: number;
  capacity: number;
  area: "interna" | "externa";
  active: boolean;
  status: "Disponível" | "Reservada" | "Ocupada";
}
export interface Availability {
  available: boolean;
  message: string;
  alternatives: string[];
}
export interface StaffSession {
  authenticated: boolean;
  csrfToken?: string;
}
let csrfToken = "";

function validReservation(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const r = value as GuestReservation;
  return (
    typeof r.token === "string" &&
    /^[a-f0-9]{64}$/.test(r.token) &&
    [r.name, r.phone, r.code, r.date, r.arrivalTime, r.note].every(
      (v) => typeof v === "string",
    ) &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
    Number.isInteger(r.guests) &&
    ["Confirmada", "Presente", "Concluída", "Cancelada"].includes(r.status) &&
    ["interna", "externa", "any"].includes(r.area) &&
    Array.isArray(r.allowedActions) &&
    r.allowedActions.every((a) =>
      ["cancel", "arrive", "complete", "release"].includes(a),
    ) &&
    (r.tables === undefined ||
      (Array.isArray(r.tables) && r.tables.every(Number.isInteger)))
  );
}
function validTable(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const t = value as ManagedTable;
  return (
    [t.id, t.number, t.capacity].every(Number.isInteger) &&
    typeof t.active === "boolean" &&
    ["interna", "externa"].includes(t.area) &&
    ["Disponível", "Reservada", "Ocupada"].includes(t.status)
  );
}
function validResponse(path: string, value: unknown): boolean {
  if (path === "/staff/logout/") return true;
  if (!value || typeof value !== "object") return false;
  if (path === "/configuration/") {
    const c = value as Configuration;
    return (
      [c.minArrival, c.maxArrival].every(
        (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      ) &&
      Number.isInteger(c.maxGuests) &&
      c.maxGuests > 0 &&
      c.maxGuests <= 1000 &&
      [c.graceMinutes, c.warningMinutes].every(
        (v) => typeof v === "number" && v >= 0,
      ) &&
      (c.contactPhone === null || typeof c.contactPhone === "string")
    );
  }
  if (["/staff/session/", "/staff/login/"].includes(path))
    return typeof (value as StaffSession).authenticated === "boolean";
  if (path.startsWith("/availability/")) {
    const a = value as Availability;
    return (
      typeof a.available === "boolean" &&
      typeof a.message === "string" &&
      Array.isArray(a.alternatives) &&
      a.alternatives.every((v) => typeof v === "string")
    );
  }
  if (path.startsWith("/staff/tables/"))
    return Array.isArray(value) ? value.every(validTable) : validTable(value);
  if (path.startsWith("/staff/reservations/?"))
    return Array.isArray(value) && value.every(validReservation);
  return validReservation(value);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrftoken="))
      ?.slice(10);
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    if (init.method && init.method !== "GET")
      headers.set("X-CSRFToken", csrfToken || decodeURIComponent(cookie ?? ""));
    const response = await fetch(base + path, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new ApiError(
        "O servidor retornou uma resposta inválida. Tente novamente.",
        response.status,
      );
    }
    if (!response.ok) {
      const fields: FieldErrors = {};
      const raw = data?.fields ?? {};
      for (const [key, value] of Object.entries(raw))
        fields[key] = Array.isArray(value) ? value.join(" ") : String(value);
      const fallback =
        response.status === 401
          ? "Sua sessão expirou. Entre novamente."
          : response.status === 403
            ? "Você não tem permissão para esta ação."
            : response.status === 404
              ? "Reserva ou registro não encontrado."
              : response.status === 409
                ? "A disponibilidade mudou. Consulte novamente antes de confirmar."
                : "Não foi possível concluir a operação.";
      throw new ApiError(
        typeof data?.detail === "string" ? data.detail : fallback,
        response.status,
        fields,
      );
    }
    if (!validResponse(path, data))
      throw new ApiError(
        "O servidor retornou dados incompatíveis. Atualize a consulta ou contate a equipe.",
        response.status,
      );
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão. Se estava confirmando uma reserva, consulte o resultado antes de tentar de novo.",
    );
  } finally {
    window.clearTimeout(timer);
  }
}

// Adaptador exclusivo de demonstração. Em modo API nenhuma decisão é calculada aqui.
function demoReservation(r: GuestReservation): GuestReservation {
  const delay = arrivalDelayMinutes(r);
  return {
    ...r,
    delayMinutes: delay ?? 0,
    late: r.status === "Confirmada" && (delay ?? 0) >= 15,
    allowedActions:
      r.status === "Confirmada"
        ? [
            "arrive",
            "cancel",
            ...(canReleaseForAbsence(r) ? ["release" as const] : []),
          ]
        : r.status === "Presente"
          ? ["complete", "cancel"]
          : [],
  };
}
const tableKey = "di-napoli:prototype:tables";
function demoTables(): ManagedTable[] {
  const saved = localStorage.getItem(tableKey);
  if (saved) return JSON.parse(saved);
  return restaurantTables.map((t) => ({
    id: t.number,
    number: t.number,
    capacity: t.capacity,
    area: t.area,
    active: true,
    status: "Disponível",
  }));
}
function validateDemo(booking: BookingDraft, contact: GuestContact) {
  const fields: FieldErrors = {};
  const today = new Date();
  const date = new Date(booking.date + "T" + booking.arrivalTime + ":00");
  if (!Number.isFinite(date.getTime()) || date < today)
    fields.arrivalTime = "Informe uma data e chegada futuras.";
  if (booking.arrivalTime < "19:30" || booking.arrivalTime > "21:30")
    fields.arrivalTime = "Informe a chegada entre 19:30 e 21:30.";
  if (
    !Number.isInteger(booking.guests) ||
    booking.guests < 1 ||
    booking.guests > 12
  )
    fields.guests = "Informe de 1 a 12 pessoas.";
  if (contact.name.trim().length < 2) fields.name = "Informe seu nome.";
  if (!/^\d{10,11}$/.test(contact.phone.replace(/\D/g, "")))
    fields.phone = "Informe um telefone com DDD de 10 ou 11 dígitos.";
  if (Object.keys(fields).length)
    throw new ApiError("Confira os campos indicados.", 400, fields);
}

export const backend = {
  async configuration(): Promise<Configuration> {
    return demoMode
      ? {
          minArrival: "19:30",
          maxArrival: "21:30",
          maxGuests: 12,
          graceMinutes: 30,
          warningMinutes: 15,
          contactPhone: null,
        }
      : request("/configuration/");
  },
  async session(): Promise<StaffSession> {
    const result: StaffSession = demoMode
      ? {
          authenticated:
            sessionStorage.getItem("di-napoli:demo-session") === "true",
        }
      : await request("/staff/session/");
    csrfToken = result.csrfToken ?? "";
    return result;
  },
  async login(username: string, password: string): Promise<StaffSession> {
    if (!demoMode) {
      const result = await request<StaffSession>("/staff/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      csrfToken = result.csrfToken ?? csrfToken;
      return result;
    }
    if (username.trim() !== "equipe" || password !== "napoli-demo")
      throw new ApiError("Usuário ou senha incorretos.", 400);
    sessionStorage.setItem("di-napoli:demo-session", "true");
    return { authenticated: true };
  },
  async logout() {
    if (demoMode) sessionStorage.removeItem("di-napoli:demo-session");
    else await request("/staff/logout/", { method: "POST" });
    csrfToken = "";
  },
  async availability(
    booking: Pick<BookingDraft, "date" | "guests" | "area">,
  ): Promise<Availability> {
    if (demoMode)
      return {
        available: true,
        message:
          "Demonstração: a disponibilidade real será verificada pelo servidor.",
        alternatives: [],
      };
    return request(
      "/availability/?" +
        new URLSearchParams({
          date: booking.date,
          guests: String(booking.guests),
          area: booking.area,
        }),
    );
  },
  async create(
    booking: BookingDraft,
    contact: GuestContact,
    requestId: string,
  ): Promise<GuestReservation> {
    if (!demoMode)
      return request("/reservations/", {
        method: "POST",
        headers: { "Idempotency-Key": requestId },
        body: JSON.stringify({
          ...booking,
          ...contact,
          phone: contact.phone.replace(/\D/g, ""),
        }),
      });
    validateDemo(booking, contact);
    return demoReservation(prototype.createReservation(booking, contact));
  },
  async read(token: string): Promise<GuestReservation> {
    if (!demoMode)
      return request("/reservations/access/", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    const r = prototype.readReservation(token);
    if (!r)
      throw new ApiError(
        "Link inválido ou reserva não encontrada neste navegador.",
        404,
      );
    const value = demoReservation(r);
    value.allowedActions =
      r.status === "Confirmada" && new Date(r.date + "T23:59:59") >= new Date()
        ? ["cancel"]
        : [];
    return value;
  },
  async cancel(token: string): Promise<GuestReservation> {
    if (!demoMode)
      return request("/reservations/cancel/", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    if (!prototype.cancelReservation(token))
      throw new ApiError("O cancelamento não está mais disponível.", 409);
    return this.read(token);
  },
  async reservations(date: string): Promise<GuestReservation[]> {
    return demoMode
      ? prototype
          .listReservations()
          .filter((r) => r.date === date)
          .map(demoReservation)
      : request("/staff/reservations/?" + new URLSearchParams({ date }));
  },
  async updateReservation(
    token: string,
    action: string,
  ): Promise<GuestReservation> {
    if (!demoMode)
      return request("/staff/reservations/action/", {
        method: "POST",
        body: JSON.stringify({ token, action }),
      });
    const status: ReservationStatus =
      action === "arrive"
        ? "Presente"
        : action === "complete"
          ? "Concluída"
          : "Cancelada";
    const r =
      action === "release"
        ? prototype.releaseAbsentReservation(token)
        : prototype.updateStaffReservation(token, status);
    if (!r)
      throw new ApiError(
        "Esta ação não está mais disponível. Atualize a lista.",
        409,
      );
    return demoReservation(r);
  },
  async tables(): Promise<ManagedTable[]> {
    return demoMode ? demoTables() : request("/staff/tables/");
  },
  async saveTable(
    table: Omit<ManagedTable, "id"> & { id?: number },
  ): Promise<ManagedTable> {
    if (!demoMode)
      return request("/staff/tables/" + (table.id ? table.id + "/" : ""), {
        method: table.id ? "PATCH" : "POST",
        body: JSON.stringify(table),
      });
    const tables = demoTables();
    if (tables.some((t) => t.number === table.number && t.id !== table.id))
      throw new ApiError("Já existe uma mesa com essa identificação.", 400, {
        number: "Use um número diferente.",
      });
    const saved = {
      ...table,
      id: table.id ?? Math.max(0, ...tables.map((t) => t.id)) + 1,
    };
    localStorage.setItem(
      tableKey,
      JSON.stringify([...tables.filter((t) => t.id !== saved.id), saved]),
    );
    return saved;
  },
};
