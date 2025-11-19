// src/components/dashboard/ThreePhaseCard.tsx
import { useTheme } from "../../theme/ThemeContext";

type TagQuality = "GOOD" | "BAD" | "UNKNOWN";

type Row = {
  label: string;
  value?: number;
  unit?: string;
  quality?: TagQuality;
};

type Props = {
  title: string;
  rows: Row[];
};

export function ThreePhaseCard({ title, rows }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardClass = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
    : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

  const titleClass = isDark
    ? "text-[11px] font-semibold text-slate-300 text-center mb-2"
    : "text-[11px] font-semibold text-slate-600 text-center mb-2";

  const labelClass = isDark
    ? "text-[11px] text-slate-400"
    : "text-[11px] text-slate-500";

  const valueClass = isDark
    ? "text-xl font-semibold text-slate-50"
    : "text-xl font-semibold text-slate-900";

  const unitClass = isDark
    ? "text-[11px] text-slate-500"
    : "text-[11px] text-slate-500";

  return (
    <div className={cardClass}>
      <div className={titleClass}>{title}</div>

      {/* linha de labels */}
      <div className="grid grid-cols-3 gap-2 mb-1">
        {rows.map((r) => (
          <div key={r.label} className="text-center">
            <div className={labelClass}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* linha de valores */}
      <div className="grid grid-cols-3 gap-2 mb-1">
        {rows.map((r) => (
          <div key={r.label} className="text-center">
            <div className={valueClass}>
              {r.value !== undefined && !Number.isNaN(r.value) ? r.value : "--"}
            </div>
          </div>
        ))}
      </div>

      {/* linha de unidades */}
      <div className="grid grid-cols-3 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="text-center">
            <div className={unitClass}>{r.unit ?? ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
