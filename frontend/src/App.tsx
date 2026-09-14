import { useState, useMemo } from "react";
import type { Screen, VerificationMethod, Role, NavigationItem } from "./types/navigation";
import type { BookingDraft } from "./types/reservation";
import { defaultBooking } from "./constants/theme";
import { MainLayout } from "./layouts/MainLayout";

// Screens
import { Login } from "./screens/auth/Login";
import { Register } from "./screens/auth/Register";
import { VerifyAccount } from "./screens/auth/VerifyAccount";
import { ClientHome } from "./screens/client/ClientHome";
import { Reserve } from "./screens/client/Reserve";
import { Times } from "./screens/client/Times";
import { Confirmation } from "./screens/client/Confirmation";
import { MyReservations } from "./screens/client/MyReservations";
import { AdminHome } from "./screens/admin/AdminHome";
import { DailyReservations } from "./screens/admin/DailyReservations";
import { TablesManagement } from "./screens/admin/TablesManagement";

const navigation: NavigationItem[] = [
  { screen: "client", label: "Início", role: "client" },
  { screen: "reserve", label: "Fazer reserva", role: "client" },
  { screen: "my-reservations", label: "Minhas reservas", role: "client" },
  { screen: "admin", label: "Painel", role: "admin" },
  { screen: "daily", label: "Reservas do dia", role: "admin" },
  { screen: "tables", label: "Mesas", role: "admin" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("email");
  const [booking, setBooking] = useState<BookingDraft>(defaultBooking);

  const publicScreens: Screen[] = ["login", "register", "verify"];
  const adminScreens: Screen[] = ["admin", "daily", "tables"];

  const isPublic = publicScreens.includes(screen);
  const role: Role = adminScreens.includes(screen) ? "admin" : "client";
  const visibleNav = navigation.filter((n) => n.role === role);

  const currentLabel = useMemo(() => {
    const map: Partial<Record<Screen, string>> = {
      times: "Horários disponíveis",
      confirmation: "Reserva confirmada",
    };
    return map[screen] ?? navigation.find((n) => n.screen === screen)?.label ?? "";
  }, [screen]);

  const go = (s: Screen) => setScreen(s);
  const resetBooking = () => setBooking(defaultBooking);

  const renderContent = () => {
    switch (screen) {
      case "login":
        return <Login go={go} />;
      case "register":
        return (
          <Register
            go={go}
            verificationMethod={verificationMethod}
            setVerificationMethod={setVerificationMethod}
          />
        );
      case "verify":
        return <VerifyAccount go={go} method={verificationMethod} />;
      case "client":
        return <ClientHome go={go} />;
      case "reserve":
        return <Reserve go={go} booking={booking} setBooking={setBooking} />;
      case "times":
        return <Times go={go} booking={booking} setBooking={setBooking} />;
      case "confirmation":
        return <Confirmation go={go} booking={booking} resetBooking={resetBooking} />;
      case "my-reservations":
        return <MyReservations go={go} />;
      case "admin":
        return <AdminHome go={go} />;
      case "daily":
        return <DailyReservations />;
      case "tables":
        return <TablesManagement />;
      default:
        return <Login go={go} />;
    }
  };

  return (
    <MainLayout
      screen={screen}
      role={role}
      isPublic={isPublic}
      currentLabel={currentLabel}
      visibleNav={visibleNav}
      onNavigate={go}
      onLogout={() => go("login")}
    >
      {renderContent()}
    </MainLayout>
  );
}
