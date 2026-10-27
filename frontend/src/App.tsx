import { useEffect, useState } from "react";
import type { Screen, Role, NavigationItem } from "./types/navigation";
import type { BookingDraft, GuestContact, GuestReservation } from "./types/reservation";
import { defaultBooking, todayISO } from "./constants/theme";
import { allSlots, fullSlots } from "./constants/tables";
import { MainLayout } from "./layouts/MainLayout";
import { Login } from "./screens/auth/Login";
import { ClientHome } from "./screens/client/ClientHome";
import { Reserve } from "./screens/client/Reserve";
import { Confirmation } from "./screens/client/Confirmation";
import { MyReservations } from "./screens/client/MyReservations";
import { AdminHome } from "./screens/admin/AdminHome";
import { DailyReservations } from "./screens/admin/DailyReservations";
import { TablesManagement } from "./screens/admin/TablesManagement";
import { cancelReservation, createReservation, readReservation, tokenFromHash, tokenFromLink } from "./services/guestReservations";

const navigation: NavigationItem[] = [
  { screen: "client", label: "Início", role: "client" },
  { screen: "reserve", label: "Fazer reserva", role: "client" },
  { screen: "my-reservations", label: "Consultar reserva", role: "client" },
  { screen: "admin", label: "Painel", role: "admin" },
  { screen: "daily", label: "Reservas do dia", role: "admin" },
  { screen: "tables", label: "Mesas", role: "admin" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => tokenFromHash() ? "my-reservations" : "client");
  const [booking, setBooking] = useState<BookingDraft>(defaultBooking);
  const [contact, setContact] = useState<GuestContact>({name: "", phone: ""});
  const [token, setToken] = useState(tokenFromHash);
  const [reservation, setReservation] = useState<GuestReservation | null>(() => readReservation(tokenFromHash()));
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      const current = tokenFromHash();
      setToken(current); setReservation(readReservation(current)); setError("");
      setScreen(current ? "my-reservations" : "client");
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("storage", sync);
    return () => {window.removeEventListener("hashchange", sync); window.removeEventListener("storage", sync);};
  }, []);

  const go = (next: Screen) => {
    setError("");
    if (next !== "confirmation" && next !== "my-reservations") {
      history.replaceState(null, "", location.pathname + location.search);
      setToken(""); setReservation(null);
    }
    if (next === "reserve") {setBooking({...defaultBooking}); setContact({name: "", phone: ""});}
    setScreen(next);
  };
  const openLink = (link: string) => {
    const current = tokenFromLink(link);
    const found = readReservation(current);
    if (!found) return false;
    history.replaceState(null, "", "#reserva=" + current);
    setToken(current); setReservation(found); setError("");
    return true;
  };
  const confirm = () => {
    const day = new Date(booking.date + "T12:00:00").getDay();
    if (contact.name.trim().length < 2 || !/^\d{10,11}$/.test(contact.phone.replace(/\D/g, "")) ||
      booking.date < todayISO || [0,1,2].includes(day) || !allSlots.includes(booking.time) || fullSlots.has(booking.time) ||
      !(new Date(booking.date + "T" + booking.time) > new Date())) {
      setError("Confira nome, telefone com DDD e um horário futuro disponível."); return;
    }
    try {
      const created = createReservation(booking, contact);
      history.replaceState(null, "", "#reserva=" + created.token);
      setToken(created.token); setReservation(created); setScreen("confirmation"); setError("");
      setBooking({...defaultBooking}); setContact({name: "", phone: ""});
    } catch {setError("Não foi possível salvar o teste neste navegador. Libere o armazenamento local e tente novamente.");}
  };
  const cancel = () => {
    try {
      const cancelled = cancelReservation(token);
      if (!cancelled) {setError("Esta reserva não está disponível para cancelamento."); setReservation(readReservation(token)); return;}
      setReservation(cancelled); setError("");
    } catch {setError("Não foi possível salvar o cancelamento. Tente novamente.");}
  };

  const isPublic = screen === "login";
  const role: Role = ["admin", "daily", "tables"].includes(screen) ? "admin" : "client";
  const currentLabel = screen === "confirmation" ? "Reserva confirmada" : navigation.find(n => n.screen === screen)?.label ?? "";
  let content;
  switch (screen) {
    case "login": content = <Login go={go}/>; break;
    case "reserve": content = <Reserve go={go} booking={booking} setBooking={setBooking} contact={contact} setContact={setContact} onConfirm={confirm} error={error}/>; break;
    case "confirmation": content = reservation ? <Confirmation go={go} reservation={reservation}/> : <ClientHome go={go}/>; break;
    case "my-reservations": content = <MyReservations go={go} reservation={reservation} invalidLink={!!token && !reservation} openLink={openLink} onCancel={cancel} error={error}/>; break;
    case "admin": content = <AdminHome go={go}/>; break;
    case "daily": content = <DailyReservations/>; break;
    case "tables": content = <TablesManagement/>; break;
    default: content = <ClientHome go={go}/>;
  }
  return <MainLayout screen={screen} role={role} isPublic={isPublic} currentLabel={currentLabel}
    visibleNav={navigation.filter(n => n.role === role)} onNavigate={go} onLogout={() => go(role === "admin" ? "client" : "login")}>
    {content}
  </MainLayout>;
}
