import { Icon } from "../ui/Icon";
import { inputClass, colors } from "../../constants/theme";

interface GuestDropdownProps {
  value: number;
  onChange: (n: number) => void;
}

export function GuestDropdown({ value, onChange }: GuestDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${inputClass} appearance-none pr-9 font-medium cursor-pointer`}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "pessoa" : "pessoas"}{" "}
          </option>
        ))}
      </select>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm"
        style={{ color: colors.muted }}
      >
        <Icon name="chevron" size={18}/>
      </div>
    </div>
  );
}
