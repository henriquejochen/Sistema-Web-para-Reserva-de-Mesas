import React, { useId } from "react";
import { colors } from "../../constants/theme";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  const generatedId = useId();
  const items = React.Children.toArray(children);
  const first = items[0] as React.ReactElement<{ id?: string }>;
  const id = (React.isValidElement(first) && first.props.id) || generatedId;
  return (
    <div
      className="grid gap-1.5 text-sm font-medium"
      style={{ color: colors.ink }}
    >
      <span className="flex items-center gap-2">
        <label htmlFor={id}>{label}</label>
        {hint && (
          <span className="text-xs font-normal" style={{ color: colors.muted }}>
            {hint}
          </span>
        )}
      </span>
      {items.map((child, index) =>
        index === 0 && React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ id?: string }>, {
              id,
            })
          : child,
      )}
    </div>
  );
}
