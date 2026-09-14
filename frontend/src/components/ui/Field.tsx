import React from "react";
import { colors } from "../../constants/theme";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium" style={{ color: colors.ink }}>
      <span className="flex items-center gap-2">
        {label}
        {hint && (
          <span className="text-xs font-normal" style={{ color: colors.muted }}>
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
