import { useState } from "react";
import type { Screen, VerificationMethod } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

interface VerifyAccountProps {
  go: (s: Screen) => void;
  method: VerificationMethod;
}

export function VerifyAccount({ go, method }: VerifyAccountProps) {
  const [code, setCode] = useState("");
  const target = method === "email" ? "ma••••@email.com" : "(11) •••••-4821";
  const methodLabel = method === "email" ? "e-mail" : "SMS";

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card className="text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ background: colors.redLight }}
        >
          {method === "email" ? "✉️" : "📱"}
        </div>
        <div
          className="mt-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: colors.red }}
        >
          Etapa 2 de 2
        </div>
        <h1 className="mt-1 text-xl font-semibold">Confirme sua conta</h1>
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          Enviamos um código de 6 dígitos por {methodLabel} para{" "}
          <strong style={{ color: colors.ink }}>{target}</strong>
        </p>

        <div className="mx-auto mt-5 max-w-[200px]">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
            placeholder="000000"
          />
        </div>

        <button type="button" className="mt-3 text-sm underline cursor-pointer" style={{ color: colors.red }}>
          Reenviar código
        </button>

        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => go("register")}>Voltar</Button>
          <Button primary disabled={code.length !== 6} onClick={() => go("client")}>
            Confirmar →
          </Button>
        </div>
      </Card>
    </div>
  );
}
