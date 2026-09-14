import React from "react";
import type { Screen, Role, NavigationItem } from "../types/navigation";
import { colors } from "../constants/theme";

interface MainLayoutProps {
  children: React.ReactNode;
  screen: Screen;
  role: Role;
  isPublic: boolean;
  currentLabel: string;
  visibleNav: NavigationItem[];
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
}

export function MainLayout({
  children,
  screen,
  role,
  isPublic,
  currentLabel,
  visibleNav,
  onNavigate,
  onLogout,
}: MainLayoutProps) {
  return (
    <div
      className="h-screen min-h-[640px] w-full sm:p-3 md:p-5"
      style={{ background: colors.cream, color: colors.ink, height: "100vh" }}
    >
      <div
        className={`mx-auto grid h-full min-h-0 max-w-[1440px] overflow-hidden bg-white sm:rounded-2xl sm:border ${
          isPublic ? "" : "lg:grid-cols-[220px_1fr]"
        }`}
        style={{ borderColor: colors.border, height: "100%" }}
      >
        {/* Sidebar (Desktop) */}
        {!isPublic && (
          <aside
            className="hidden border-r p-5 lg:flex lg:flex-col"
            style={{ borderColor: colors.border, background: colors.paper }}
          >
            <div className="mb-7 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ background: colors.red }}
              >
                🍕
              </div>
              <div>
                <strong className="block text-sm">Forno & Mesa</strong>
                <span className="text-xs" style={{ color: colors.muted }}>
                  {role === "admin" ? "Equipe" : "Cliente"}
                </span>
              </div>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: colors.muted }}>
              Menu
            </p>

            <nav className="grid gap-1">
              {visibleNav.map((item) => (
                <button
                  key={item.screen}
                  type="button"
                  onClick={() => onNavigate(item.screen)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm transition cursor-pointer"
                  style={{
                    background: screen === item.screen ? colors.redLight : "transparent",
                    color: screen === item.screen ? colors.redDark : colors.ink,
                    fontWeight: screen === item.screen ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm transition cursor-pointer"
                style={{ color: colors.muted }}
              >
                Sair
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex min-h-0 min-w-0 flex-col">
          {!isPublic && (
            <>
              <header
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: colors.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm lg:hidden"
                    style={{ background: colors.red }}
                  >
                    🍕
                  </div>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {currentLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-sm lg:hidden cursor-pointer"
                  style={{ color: colors.muted }}
                >
                  Sair
                </button>
              </header>

              {/* Mobile navigation bar */}
              <nav
                className="grid border-b lg:hidden"
                style={{
                  borderColor: colors.border,
                  gridTemplateColumns: `repeat(${visibleNav.length}, 1fr)`,
                }}
              >
                {visibleNav.map((item) => (
                  <button
                    key={item.screen}
                    type="button"
                    onClick={() => onNavigate(item.screen)}
                    className="px-2 py-3 text-center text-xs font-medium cursor-pointer"
                    style={{
                      background: screen === item.screen ? colors.redLight : colors.paper,
                      color: screen === item.screen ? colors.redDark : colors.ink,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </>
          )}

          <div className={`min-h-0 flex-1 ${isPublic ? "" : "overflow-auto p-5 sm:p-6"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
