import React from "react";
import { colors } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", style = {} }: CardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        background: colors.paper,
        borderColor: colors.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
