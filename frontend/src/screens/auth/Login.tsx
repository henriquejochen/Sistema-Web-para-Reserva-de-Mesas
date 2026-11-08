import { useState } from "react";
import type { Screen } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { demoMode, errorMessage } from "../../services/backend";
import logo from "../../assets/logo.jpg";
export function Login({
  go,
  onLogin,
  notice,
}: {
  go: (s: Screen) => void;
  onLogin: (username: string, password: string) => Promise<void>;
  notice?: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section
        className="flex flex-col justify-center items-center px-6 py-8 lg:p-12 text-white"
        style={{ background: colors.red }}
      >
        <img
          src={logo}
          alt=""
          className="h-16 w-16 lg:h-28 lg:w-28 rounded-2xl object-cover"
        />
        <h1 className="mt-4 font-brand text-2xl lg:text-4xl text-center">
          Pizzaria Di Napoli
        </h1>
        <p className="mt-3 text-sm text-center">
          Espaço de trabalho da equipe.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-8 lg:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Acesso da equipe</h2>
          <p className="mt-2 mb-6 text-sm">Entre com seu usuário e senha.</p>
          <form
            aria-busy={busy}
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              try {
                await onLogin(username, password);
              } catch (err) {
                setError(errorMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy} className="grid gap-4">
              <legend className="sr-only">Credenciais da equipe</legend>
              <div>
                <label
                  htmlFor="staff-username"
                  className="block mb-2 text-sm font-medium"
                >
                  Usuário
                </label>
                <input
                  id="staff-username"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="staff-password"
                  className="block mb-2 text-sm font-medium"
                >
                  Senha
                </label>
                <input
                  id="staff-password"
                  required
                  autoComplete="current-password"
                  className={inputClass}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {(error || notice) && (
                <p role="alert" className="text-sm text-red-800">
                  {error || notice}
                </p>
              )}
              <Button primary full type="submit" disabled={busy}>
                {busy ? "Entrando…" : "Entrar"}
              </Button>
            </fieldset>
          </form>
          {demoMode && (
            <div
              className="mt-5 rounded-xl p-4 text-sm"
              style={{ background: colors.cream }}
            >
              <strong>Acesso de demonstração</strong>
              <p className="mt-1">Usuário: equipe · Senha: napoli-demo</p>
            </div>
          )}
          <div className="mt-4">
            <Button full disabled={busy} onClick={() => go("client")}>
              Voltar ao site
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
