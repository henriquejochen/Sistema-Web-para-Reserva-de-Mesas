import { useEffect, useRef, useState } from "react";
import type { Screen, Role, NavigationItem } from "./types/navigation";
import type {
  BookingDraft,
  GuestContact,
  GuestReservation,
} from "./types/reservation";
import { defaultBooking } from "./constants/theme";
import { MainLayout } from "./layouts/MainLayout";
import { Login } from "./screens/auth/Login";
import { ClientHome } from "./screens/client/ClientHome";
import { Reserve } from "./screens/client/Reserve";
import { Confirmation } from "./screens/client/Confirmation";
import { MyReservations } from "./screens/client/MyReservations";
import { AdminHome } from "./screens/admin/AdminHome";
import { DailyReservations } from "./screens/admin/DailyReservations";
import { TablesManagement } from "./screens/admin/TablesManagement";
import { tokenFromHash, tokenFromLink } from "./services/guestReservations";
import { ApiError, backend, demoMode, errorMessage } from "./services/backend";
import type { Configuration, FieldErrors } from "./services/backend";
import { RequestState } from "./components/ui/RequestState";

const navigation: NavigationItem[] = [
  { screen: "client", label: "Início", role: "client" },
  { screen: "reserve", label: "Fazer reserva", role: "client" },
  { screen: "my-reservations", label: "Consultar reserva", role: "client" },
  { screen: "admin", label: "Painel", role: "admin" },
  { screen: "daily", label: "Reservas do dia", role: "admin" },
  { screen: "tables", label: "Mesas", role: "admin" },
];
const paths: Partial<Record<Screen, string>> = {
  client: "/",
  reserve: "/reservar",
  "my-reservations": "/reserva",
  confirmation: "/confirmacao",
  admin: "/equipe",
  daily: "/equipe/reservas",
  tables: "/equipe/mesas",
  login: "/equipe/login",
};
const teamScreens: Screen[] = ["admin", "daily", "tables"];
function route(): Screen {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return (
    (Object.entries(paths).find(
      ([, value]) => value === path,
    )?.[0] as Screen) ?? (tokenFromHash() ? "my-reservations" : "client")
  );
}
export default function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    tokenFromHash() && location.pathname === "/" ? "my-reservations" : route(),
  );
  const [session, setSession] = useState<boolean | null>(null);
  const [config, setConfig] = useState<Configuration | null>(null);
  const [setupError, setSetupError] = useState("");
  const [setupAttempt, setSetupAttempt] = useState(0);
  const [booking, setBooking] = useState<BookingDraft>({ ...defaultBooking });
  const [contact, setContact] = useState<GuestContact>({ name: "", phone: "" });
  const [reservation, setReservation] = useState<GuestReservation | null>(null);
  const [token, setToken] = useState(tokenFromHash);
  const [readAttempt, setReadAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const requestId = useRef(crypto.randomUUID());
  const actionLock = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([backend.configuration(), backend.session()])
      .then(([configuration, staff]) => {
        if (active) {
          setConfig(configuration);
          setSession(staff.authenticated);
        }
      })
      .catch((e) => {
        if (active) setSetupError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [setupAttempt]);
  useEffect(() => {
    const sync = () => {
      setScreen(
        tokenFromHash() && location.pathname === "/"
          ? "my-reservations"
          : route(),
      );
      setToken(tokenFromHash());
      setReadAttempt((v) => v + 1);
      setError("");
      setReservation(null);
    };
    const expire = () => {
      setSession(false);
      setError("Sua sessão expirou. Entre novamente.");
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("staff-session-expired", expire);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("staff-session-expired", expire);
    };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      const heading = document.querySelector<HTMLElement>("h1, h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [screen, session]);
  useEffect(() => {
    if (!token || !["confirmation", "my-reservations"].includes(screen)) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setBusy(true);
        setError("");
      }
    });
    backend
      .read(token)
      .then((r) => {
        if (active) setReservation(r);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [token, screen, readAttempt]);

  const go = (next: Screen, accessToken = "") => {
    const keepToken =
      accessToken ||
      (["confirmation", "my-reservations"].includes(next) ? token : "");
    history.pushState(
      null,
      "",
      (paths[next] ?? "/") +
        (keepToken ? "#reserva=" + encodeURIComponent(keepToken) : ""),
    );
    setToken(keepToken);
    setScreen(next);
    setError("");
    setFields({});
    if (!keepToken) setReservation(null);
  };
  const handleError = (e: unknown) => {
    setError(errorMessage(e));
    setFields(e instanceof ApiError ? e.fields : {});
    if (e instanceof ApiError && e.status === 401) setSession(false);
  };
  const confirm = async () => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setError("");
    setFields({});
    try {
      const created = await backend.create(booking, contact, requestId.current);
      setReservation(created);
      go("confirmation", created.token);
      setBooking({ ...defaultBooking });
      setContact({ name: "", phone: "" });
      requestId.current = crypto.randomUUID();
    } catch (e) {
      handleError(e);
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setError("");
    try {
      setReservation(await backend.cancel(token));
    } catch (e) {
      handleError(e);
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const openLink = async (link: string) => {
    const current = tokenFromLink(link);
    if (!current) {
      setError("Cole um link de reserva válido deste site.");
      return;
    }
    go("my-reservations", current);
    setReadAttempt((v) => v + 1);
  };
  const login = async (username: string, password: string) => {
    const result = await backend.login(username, password);
    if (!result.authenticated)
      throw new ApiError("Não foi possível iniciar a sessão.");
    setSession(true);
    setError("");
    if (!teamScreens.includes(screen)) go("admin");
  };
  const logout = async () => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    try {
      await backend.logout();
      setSession(false);
      go("login");
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
      actionLock.current = false;
    }
  };
  const retryRead = async () => {
    setBusy(true);
    setError("");
    try {
      setReservation(await backend.read(token));
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };
  const needsLogin = teamScreens.includes(screen) && session === false;
  const role: Role = teamScreens.includes(screen) ? "admin" : "client";
  const isPublic = screen === "login" || needsLogin;
  let content;
  if (!config || session === null)
    content = (
      <RequestState
        loading={!setupError}
        error={setupError}
        retry={() => {
          setSetupError("");
          setSetupAttempt((v) => v + 1);
        }}
      />
    );
  else if (isPublic)
    content = (
      <Login go={go} onLogin={login} notice={needsLogin ? error : ""} />
    );
  else
    switch (screen) {
      case "reserve":
        content = (
          <Reserve
            go={go}
            booking={booking}
            setBooking={(b) => {
              setBooking(b);
              requestId.current = crypto.randomUUID();
            }}
            contact={contact}
            setContact={(c) => {
              setContact(c);
              requestId.current = crypto.randomUUID();
            }}
            onConfirm={confirm}
            error={error}
            fields={fields}
            busy={busy}
            config={config}
          />
        );
        break;
      case "confirmation":
        content =
          reservation && !busy && !error ? (
            <Confirmation go={go} reservation={reservation} />
          ) : (
            <MyReservations
              go={go}
              reservation={reservation}
              openLink={openLink}
              onCancel={cancel}
              busy={busy}
              error={error}
              retry={retryRead}
              config={config}
            />
          );
        break;
      case "my-reservations":
        content = (
          <MyReservations
            go={go}
            reservation={reservation}
            openLink={openLink}
            onCancel={cancel}
            busy={busy}
            error={error}
            retry={retryRead}
            config={config}
          />
        );
        break;
      case "admin":
        content = <AdminHome go={go} />;
        break;
      case "daily":
        content = <DailyReservations config={config} />;
        break;
      case "tables":
        content = <TablesManagement />;
        break;
      default:
        content = <ClientHome go={go} />;
    }
  return (
    <MainLayout
      screen={screen}
      role={role}
      isPublic={isPublic}
      currentLabel={
        navigation.find((n) => n.screen === screen)?.label ?? "Reserva"
      }
      visibleNav={navigation.filter((n) => n.role === role)}
      onNavigate={go}
      onLogout={logout}
      busy={busy}
    >
      {demoMode && (
        <p className="demo-notice mb-4 rounded-xl border p-3 text-sm">
          Demonstração local. Use dados fictícios; nenhuma reserva é enviada à
          pizzaria.
        </p>
      )}
      {!isPublic && error && teamScreens.includes(screen) && (
        <p role="alert" className="mb-4">
          {error}
        </p>
      )}
      {content}
    </MainLayout>
  );
}
