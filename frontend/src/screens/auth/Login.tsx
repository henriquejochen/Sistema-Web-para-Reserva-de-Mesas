import type { Screen } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";

interface LoginProps {
  go: (s: Screen) => void;
}

export function Login({ go }: LoginProps) {
  return (
    <div
      className="grid h-full min-h-[620px] overflow-hidden bg-white sm:rounded-2xl sm:border lg:grid-cols-2"
      style={{ borderColor: colors.border }}
    >
      <div
        className="flex flex-col justify-center px-8 py-10 lg:px-14"
        style={{ background: colors.redLight }}
      >
        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ background: colors.red }}
        >
          🍕
        </div>
        <h1 className="max-w-xs text-3xl font-semibold leading-tight" style={{ color: colors.ink }}>
          Reserve sua mesa de forma simples.
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: colors.muted }}>
          Escolha a data, o horário e receba a confirmação em segundos.
        </p>
      </div>

      <div className="flex items-center justify-center bg-white px-8 py-10">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold" style={{ color: colors.ink }}>
            Entrar
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            Acesse sua conta para fazer ou gerenciar reservas.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="E-mail">
              <input className={inputClass} placeholder="nome@email.com" type="email" />
            </Field>

            <Field label="Senha">
              <input className={inputClass} placeholder="••••••••" type="password" />
            </Field>

            <Button primary full onClick={() => go("client")}>
              Entrar
            </Button>
            <Button full onClick={() => go("admin")}>
              Entrar como equipe
            </Button>

            <p className="text-center text-sm" style={{ color: colors.muted }}>
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => go("register")}
                className="font-medium underline cursor-pointer"
                style={{ color: colors.red }}
              >
                Criar agora
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
