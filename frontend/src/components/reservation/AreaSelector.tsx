import { Icon } from "../ui/Icon";
import type { AreaPreference } from "../../types/reservation";
import { colors } from "../../constants/theme";
import { areaOptions } from "../../constants/tables";

interface AreaSelectorProps {
  value: AreaPreference;
  onChange: (a: AreaPreference) => void;
}

export function AreaSelector({ value, onChange }: AreaSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {areaOptions.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all cursor-pointer"
            style={{
              background: active ? colors.redLight : colors.paper,
              borderColor: active ? colors.red : colors.border,
              color: active ? colors.redDark : colors.muted,
            }}
          >
            <Icon name={opt.icon}/>
            <span className="text-xs font-semibold" style={{ color: active ? colors.redDark : colors.ink }}>
              {opt.label}
            </span>
            <span className="text-[10px] leading-tight" style={{ color: colors.muted }}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
