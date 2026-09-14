import React from "react";
import { colors } from "../../constants/theme";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageTitle({ title, subtitle, action }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: colors.ink }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
