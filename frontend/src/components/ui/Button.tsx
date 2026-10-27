import React from "react";
import { colors } from "../../constants/theme";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  outline?: boolean;
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  primary = false,
  danger = false,
  outline = false,
  disabled = false,
  full = false,
  type = "button",
}: ButtonProps) {
  let bg = colors.paper;
  let color = colors.ink;
  let border = colors.border;

  if (primary) {
    bg = colors.red;
    color = "white";
    border = colors.red;
  }
  if (danger) {
    bg = "#FFF0ED";
    color = colors.red;
    border = "#FBCFC7";
  }
  if (outline) {
    bg = "transparent";
    color = colors.red;
    border = colors.red;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 min-h-12 rounded-lg border px-4 py-3 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
        full ? "w-full" : ""
      }`}
      style={{ background: bg, color, borderColor: border }}
    >
      {children}
    </button>
  );
}
