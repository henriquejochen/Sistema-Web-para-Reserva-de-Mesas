import type { Screen } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import logo from "../../assets/logo.jpg";

interface LoginProps {
  go: (s: Screen) => void;
}

export function Login({ go }: LoginProps) {
  return (
    <div
      className="grid h-full min-h-[620px] overflow-hidden bg-white sm:rounded-2xl sm:border lg:grid-cols-2"
      style={{ borderColor: colors.border }}
    >
      {/* Hero / Brand Panel */}
      <div
        className="relative flex flex-col items-center justify-center px-8 py-12 lg:px-14 overflow-hidden"
        style={{ background: colors.red }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -left-16 h-56 w-56 rounded-full opacity-10"
          style={{ background: "white" }}
        />
        <div
          className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full opacity-10"
          style={{ background: "white" }}
        />

        {/* Logo */}
        <img
          src={logo}
          alt="Pizzaria Di Napoli"
          className="relative z-10 mb-6 h-28 w-28 rounded-2xl object-cover shadow-xl"
          style={{ border: "3px solid rgba(255,255,255,0.4)" }}
        />

        <h1
          className="font-brand relative z-10 text-center text-3xl font-bold leading-tight text-white"
        >
          Pizzaria Di Napoli
        </h1>
        <p className="relative z-10 mt-3 max-w-xs text-center text-sm leading-relaxed text-white/80">
          Reserve sua mesa de forma simples e rápida. Escolha a data, o horário e receba a confirmação em segundos.
        </p>

        {/* Info badges */}
        <div className="relative z-10 mt-6 flex flex-col gap-2 text-sm text-white/90">
          <div className="flex items-center gap-2">
            <span>🍽️</span>
            <span>Rodízio de quarta à sábado</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛵</span>
            <span>Delivery para Cocal do Sul</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <a
              href="https://pizzariadinapoli.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              pizzariadinapoli.com.br
            </a>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center bg-white px-8 py-10">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold" style={{ color: colors.ink }}>
            Acesso da equipe
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            Área de demonstração para funcionários e administradores.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="E-mail">
              <input className={inputClass} placeholder="nome@email.com" type="email" />
            </Field>

            <Field label="Senha">
              <input className={inputClass} placeholder="••••••••" type="password" />
            </Field>

            <Button primary full onClick={() => go("admin")}>
              Entrar como equipe (protótipo)
            </Button>
            <Button full onClick={() => go("client")}>Voltar ao site do cliente</Button>
            <p className="text-xs" style={{color: colors.muted}}>Autenticação simulada no protótipo. O acesso real da equipe exigirá validação no servidor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
