import type { Screen, VerificationMethod } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";

interface RegisterProps {
  go: (s: Screen) => void;
  verificationMethod: VerificationMethod;
  setVerificationMethod: (m: VerificationMethod) => void;
}

export function Register({
  go,
  verificationMethod,
  setVerificationMethod,
}: RegisterProps) {
  return (
    <div className="mx-auto w-full max-w-lg py-6">
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
          style={{ background: colors.red }}
        >
          🍕
        </div>
        <div>
          <strong className="block text-sm">Forno & Mesa</strong>
          <span className="text-xs" style={{ color: colors.muted }}>
            Criar conta
          </span>
        </div>
      </div>

      <Card>
        <div
          className="mb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: colors.red }}
        >
          Etapa 1 de 2
        </div>
        <h1 className="mt-1 text-xl font-semibold">Seus dados</h1>
        <p className="mt-1 text-sm" style={{ color: colors.muted }}>
          Preencha para fazer e acompanhar reservas.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo">
              <input className={inputClass} placeholder="Seu nome" />
            </Field>
          </div>
          <Field label="E-mail">
            <input className={inputClass} type="email" placeholder="nome@email.com" />
          </Field>
          <Field label="Celular">
            <input className={inputClass} type="tel" placeholder="(00) 00000-0000" />
          </Field>
          <Field label="Senha">
            <input className={inputClass} type="password" placeholder="Mínimo 8 caracteres" />
          </Field>
          <Field label="Confirmar senha">
            <input className={inputClass} type="password" placeholder="Repita a senha" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Receber código por">
              <select
                className={inputClass}
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
              >
                <option value="email">E-mail</option>
                <option value="phone">SMS no celular</option>
              </select>
            </Field>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2.5 text-sm cursor-pointer" style={{ color: colors.muted }}>
          <input type="checkbox" className="mt-0.5" />
          Concordo com os termos de uso e política de privacidade.
        </label>

        <div className="mt-5 flex justify-between gap-2">
          <Button onClick={() => go("login")}>Já tenho conta</Button>
          <Button primary onClick={() => go("verify")}>
            Continuar →
          </Button>
        </div>
      </Card>
    </div>
  );
}
