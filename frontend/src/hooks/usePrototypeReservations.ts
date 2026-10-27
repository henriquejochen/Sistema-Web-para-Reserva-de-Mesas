import { useEffect, useState } from "react";
import type { GuestReservation } from "../types/reservation";
import { listReservations, RESERVATIONS_CHANGED } from "../services/guestReservations";

export function usePrototypeReservations() {
  const [reservations, setReservations] = useState<GuestReservation[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => {
      try {setReservations(listReservations()); setError("");}
      catch {setError("Não foi possível ler os testes. Verifique o acesso ao armazenamento deste navegador.");}
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(RESERVATIONS_CHANGED, refresh);
    return () => {window.removeEventListener("storage", refresh); window.removeEventListener(RESERVATIONS_CHANGED, refresh);};
  }, []);
  return { reservations, error };
}
