import { useEffect, useState } from "react";
import type { Screen, Role, NavigationItem } from "./types/navigation";
import type { BookingDraft, GuestContact, GuestReservation } from "./types/reservation";
import { defaultBooking, localDateISO } from "./constants/theme";
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
import { isArrivalWithinOpeningHours, MIN_ARRIVAL_TIME, MAX_ARRIVAL_TIME, arrivalDelayMinutes } from "./services/arrivalPolicy";

const navigation: NavigationItem[] = [
  { screen: "client", label: "Início", role: "client" },
  { screen: "reserve", label: "Fazer reserva", role: "client" },
  { screen: "my-reservations", label: "Consultar reserva", role: "client" },
  { screen: "admin", label: "Painel", role: "admin" },
  { screen: "daily", label: "Reservas do dia", role: "admin" },
  { screen: "tables", label: "Mesas", role: "admin" },
];
const isTeamPath = () => /^\/equipe\/?$/.test(location.pathname);
const adminScreens: Screen[] = ["admin", "daily", "tables"];

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => isTeamPath() ? "login" : tokenFromHash() ? "my-reservations" : "client");
  const [staffAuthenticated, setStaffAuthenticated] = useState(false);
  const [booking, setBooking] = useState<BookingDraft>(defaultBooking);
  const [contact, setContact] = useState<GuestContact>({name: "", phone: ""});
  const [token, setToken] = useState(tokenFromHash);
  const [reservation, setReservation] = useState<GuestReservation | null>(() => readReservation(tokenFromHash()));
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      const current = tokenFromHash();
      setToken(current); setReservation(readReservation(current)); setError("");
      setStaffAuthenticated(false);
      setScreen(isTeamPath() ? "login" : current ? "my-reservations" : "client");
    };
    window.addEventListener("hashchange", sync);
    const syncStorage = (event: StorageEvent) => {
      if (!isTeamPath() && (event.key === null || event.key === "di-napoli:prototype:reservation:" + tokenFromHash())) {
        setReservation(readReservation(tokenFromHash()));
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("storage", syncStorage);
    return () => {window.removeEventListener("hashchange", sync); window.removeEventListener("popstate", sync); window.removeEventListener("storage", syncStorage);};
  }, []);

  const go = (next: Screen) => {
    if (adminScreens.includes(next) && (!isTeamPath() || !staffAuthenticated)) {
      setScreen(isTeamPath() ? "login" : "client"); return;
    }
    setError("");
    if (next !== "confirmation" && next !== "my-reservations") {
      history.replaceState(null, "", location.pathname + location.search);
      setToken(""); setReservation(null);
    }
    if (isTeamPath() && !adminScreens.includes(next) && next !== "login") {
      history.pushState(null, "", "/"); setStaffAuthenticated(false);
    }
    if (next === "reserve") {setBooking({...defaultBooking, date: localDateISO()}); setContact({name: "", phone: ""});}
    setScreen(next);
  };
  const login = (username: string, password: string) => {
    if (!isTeamPath() || username.trim() !== "equipe" || password !== "napoli-demo") return false;
    setStaffAuthenticated(true); setScreen("admin"); return true;
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
    if (!isArrivalWithinOpeningHours(booking.arrivalTime)) {
      setError(`Informe a previsão de chegada entre ${MIN_ARRIVAL_TIME} e ${MAX_ARRIVAL_TIME}.`); return;
    }
    if (contact.name.trim().length < 2 || !/^\d{10,11}$/.test(contact.phone.replace(/\D/g, "")) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(booking.date) || !Number.isFinite(new Date(booking.date + "T12:00:00").getTime()) ||
      booking.date < localDateISO() || !Number.isInteger(booking.guests) || booking.guests < 1 || booking.guests > 12 ||
      (arrivalDelayMinutes(booking) ?? 0) > 0) {
      setError("Confira nome, telefone com DDD, quantidade de pessoas, data e previsão de chegada. A chegada não pode estar no passado."); return;
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
    case "login": content = <Login go={go} onLogin={login}/>; break;
    case "reserve": content = <Reserve go={go} booking={booking} setBooking={setBooking} contact={contact} setContact={setContact} onConfirm={confirm} error={error}/>; break;
    case "confirmation": content = reservation ? <Confirmation go={go} reservation={reservation}/> : <ClientHome go={go}/>; break;
    case "my-reservations": content = <MyReservations go={go} reservation={reservation} invalidLink={!!token && !reservation} openLink={openLink} onCancel={cancel} error={error}/>; break;
    case "admin": content = <AdminHome go={go}/>; break;
    case "daily": content = <DailyReservations/>; break;
    case "tables": content = <TablesManagement/>; break;
    default: content = <ClientHome go={go}/>;
  }
  return <MainLayout screen={screen} role={role} isPublic={isPublic} currentLabel={currentLabel}
    visibleNav={navigation.filter(n => n.role === role)} onNavigate={go} onLogout={() => {setStaffAuthenticated(false); setScreen("login");}}>
    {content}
  </MainLayout>;
}
