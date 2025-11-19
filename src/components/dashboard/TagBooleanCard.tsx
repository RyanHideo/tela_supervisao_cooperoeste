// src/components/dashboard/TagBooleanCard.tsx
import { useTheme } from "../../theme/ThemeContext";

type Props = {
  label: string;
  value?: boolean;
  quality?: string;
};

export function TagBooleanCard({ label, value, quality }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isOn = !!value;

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

  const pillClassBase =
    "px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[72px]";

  const pillClass = isOn
    ? isDark
      ? pillClassBase + " bg-emerald-500 text-slate-950"
      : pillClassBase + " bg-emerald-500 text-white"
    : isDark
    ? pillClassBase + " bg-slate-800 text-slate-300"
    : pillClassBase + " bg-slate-100 text-slate-600";

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <span className={labelClass}>{label}</span>
        <div className="flex items-center gap-1 text-[11px]">
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          <span className={chipClass}>{qualityLabel}</span>
        </div>
      </div>

      <div className="mt-1">
        <span className={pillClass}>{isOn ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
}
