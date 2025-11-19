// src/components/dashboard/TagValueCard.tsx
import { useTheme } from "../../theme/ThemeContext";

type Props = {
  label: string;
  value?: number;
  unit?: string;
  decimals?: number;
  quality?: string;
};

export function TagValueCard({
  label,
  value,
  unit,
  decimals = 0,
  quality,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  let display = "--";
  if (typeof value === "number" && !Number.isNaN(value)) {
    display = value.toFixed(decimals).replace(".", ",");
  }

  const qualityLabel = quality ?? "UNKNOWN";
  const isGood = quality === "GOOD";
  const isBad = quality === "BAD";

  const dotClass = isGood
    ? "bg-emerald-400"
    : isBad
    ? "bg-rose-400"
    : "bg-slate-500";

  const chipClass = isGood
    ? "text-emerald-300"
    : isBad
    ? "text-rose-300"
    : "text-slate-400";

  const cardClass = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3 transition-colors"
    : "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm transition-colors";

  const labelClass = isDark
    ? "text-[11px] font-medium text-slate-400"
    : "text-[11px] font-medium text-slate-500";

  const valueClass = isDark
    ? "text-2xl font-semibold text-slate-50"
    : "text-2xl font-semibold text-slate-900";

  // Unidades mais aparentes
  const unitClass = isDark
    ? "text-sm font-semibold text-emerald-300"
    : "text-sm font-semibold text-emerald-700";

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        {label && <span className={labelClass}>{label}</span>}
        <div className="flex items-center gap-1 text-[11px]">
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          <span className={chipClass}>{qualityLabel}</span>
        </div>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className={valueClass}>{display}</span>
        {unit && <span className={unitClass}>{unit}</span>}
      </div>
    </div>
  );
}
