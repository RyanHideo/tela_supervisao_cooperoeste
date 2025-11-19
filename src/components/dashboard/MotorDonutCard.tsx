// src/components/dashboard/MotorDonutCard.tsx
import { useMemo } from "react";
import { useTheme } from "../../theme/ThemeContext";

type Props = {
  total: number;
  ativos: number;
  falha: number;
  desligados: number;
};

export function MotorDonutCard({ total, ativos, falha, desligados }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardClass = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 flex flex-col gap-1.5"
    : "rounded-2xl border border-slate-200 bg-white px-3 py-2 flex flex-col gap-1.5 shadow-sm";

  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const summary = useMemo(() => {
    const safeTotal = total > 0 ? total : 0;

    const clamp = (n: number) => (n < 0 || !Number.isFinite(n) ? 0 : n);

    const a = clamp(ativos);
    const f = clamp(falha);
    const d = clamp(
      desligados !== undefined ? desligados : safeTotal - a - f
    );

    const base = a + f + d || 1;

    const pctAtivos = (a / base) * 100;
    const pctFalha = (f / base) * 100;
    const pctDesligados = (d / base) * 100;

    return {
      total: safeTotal,
      a,
      f,
      d,
      pctAtivos,
      pctFalha,
      pctDesligados,
    };
  }, [total, ativos, falha, desligados]);

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const lenAtivos = (summary.pctAtivos / 100) * circumference;
  const lenFalha = (summary.pctFalha / 100) * circumference;
  const lenDesligados = (summary.pctDesligados / 100) * circumference;

  const offsetAtivos = 0;
  const offsetFalha = offsetAtivos + lenAtivos;
  const offsetDesligados = offsetFalha + lenFalha;

  const centerLabelClass = isDark
    ? "text-[11px] font-medium text-slate-400"
    : "text-[11px] font-medium text-slate-500";

  const centerValueClass = isDark
    ? "text-xl md:text-2xl font-bold text-slate-50"
    : "text-xl md:text-2xl font-bold text-slate-900";

  const valueColor = isDark ? "text-slate-50" : "text-slate-900";

  return (
    <div className={cardClass}>
      {/* chip Total (fonte maior) */}
      <div className="flex justify-end">
        <span
          className={
            "rounded-full px-3 py-1 text-xs sm:text-sm font-semibold " +
            (isDark
              ? "bg-slate-800 text-slate-100"
              : "bg-slate-100 text-slate-700")
          }
        >
          Total: <span className="font-bold">{summary.total}</span>
        </span>
      </div>

      {/* conteúdo principal */}
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:items-center sm:gap-2">
        {/* Donut grande */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <div className="relative h-48 w-48">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* trilho */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isDark ? "#1e293b" : "#e5e7eb"}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Ativos */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${lenAtivos} ${circumference - lenAtivos}`}
                strokeDashoffset={-offsetAtivos}
                transform="rotate(-90 50 50)"
              />
              {/* Falha */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#f97316"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${lenFalha} ${circumference - lenFalha}`}
                strokeDashoffset={-offsetFalha}
                transform="rotate(-90 50 50)"
              />
              {/* Desligados */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#64748b"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${lenDesligados} ${
                  circumference - lenDesligados
                }`}
                strokeDashoffset={-offsetDesligados}
                transform="rotate(-90 50 50)"
              />
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={centerLabelClass}>Ativos</span>
              <span className={centerValueClass}>{summary.a}</span>
            </div>
          </div>
        </div>

        {/* legenda / números à direita */}
        <div className="flex-1 flex justify-start sm:justify-end">
          <div className="w-full max-w-[190px] space-y-1.5 text-sm">
            <LegendRow
              color="bg-emerald-500"
              label="Ativos"
              valor={summary.a}
              pct={summary.pctAtivos}
              isDark={isDark}
              valueColor={valueColor}
            />
            <LegendRow
              color="bg-orange-500"
              label="Falha/Alarme"
              valor={summary.f}
              pct={summary.pctFalha}
              isDark={isDark}
              valueColor={valueColor}
            />
            <LegendRow
              color="bg-slate-500"
              label="Desligados"
              valor={summary.d}
              pct={summary.pctDesligados}
              isDark={isDark}
              valueColor={valueColor}
            />
          </div>
        </div>
      </div>

      <p className={`mt-1 text-[11px] ${textMuted}`}>
        Distribuição dos motores por status em tempo real.
      </p>
    </div>
  );
}

type LegendProps = {
  color: string;
  label: string;
  valor: number;
  pct: number;
  isDark: boolean;
  valueColor: string;
};

function LegendRow({
  color,
  label,
  valor,
  pct,
  isDark,
  valueColor,
}: LegendProps) {
  const muted = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className="flex items-center justify-between gap-1.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {/* label maior */}
        <span className={`text-sm ${muted}`}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 text-right">
        {/* valor maior */}
        <span className={`text-sm font-semibold ${valueColor}`}>{valor}</span>
        {/* porcentagem um pouco menor */}
        <span className={`text-xs ${muted}`}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
