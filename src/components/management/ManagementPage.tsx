// src/components/management/ManagementPage.tsx
import React from "react";
import { useTheme } from "../../theme/ThemeContext";
import { useEfficiency } from "../../hooks/useEfficiency";

/** ==================== COMPONENTES VISUAIS ==================== */
/** Donut de eficiência: 0–100% */

type EfficiencyDonutProps = {
  value: number; // 0–100
  isDark: boolean;
  description: string;
};

function EfficiencyDonut({
  value,
  isDark,
  description,
}: EfficiencyDonutProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const visual = Math.min(clamped, 99.5);
  const fillColor = isDark ? "#22c55e" : "#16a34a";
  const trackColor = isDark ? "#1e293b" : "#e5e7eb";
  const bgColor = isDark ? "#020617" : "#f9fafb";

  const bg = `conic-gradient(
    ${fillColor} 0deg ${visual * 3.6}deg,
    ${trackColor} ${visual * 3.6}deg 360deg
  )`;

  const labelColor = isDark ? "text-slate-300" : "text-slate-700";
  const descColor = isDark ? "text-slate-400" : "text-slate-700";

  return (
    <div className="flex items-center justify-center gap-6 h-full">
      <div
        className="relative w-32 h-32 sm:w-36 sm:h-36 xl:w-40 xl:h-40 rounded-full"
        style={{ backgroundImage: bg }}
      >
        <div
          className="absolute inset-5 sm:inset-6 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <span
            className={`text-[11px] sm:text-xs tracking-[0.18em] uppercase ${labelColor}`}
          >
            {/* Label opcional */}
          </span>
          <span className="text-3xl sm:text-4xl xl:text-5xl font-semibold">
            {clamped.toFixed(0)}%
          </span>
        </div>
      </div>

      <span
        className={`max-w-[220px] text-[11px] sm:text-xs text-left ${descColor}`}
      >
        {description}
      </span>
    </div>
  );
}

/** Barras dos elevadores (0–100%) – COR ÚNICA */

type ElevatorsChartProps = {
  values: number[];
  isDark: boolean;
};

function ElevatorsChart({ values, isDark }: ElevatorsChartProps) {
  const accent = isDark ? "#38bdf8" : "#0284c7";

  const valueColor = isDark ? "text-slate-100" : "text-slate-700";
  const labelColor = isDark ? "text-slate-200" : "text-slate-500";
  const footerColor = isDark ? "text-slate-200" : "text-slate-700";

  return (
    <div className="mt-3 flex flex-col gap-4 h-48 sm:h-52 xl:h-56 px-3">
      <div className="relative flex-1 flex items-end gap-4">
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            backgroundColor: isDark
              ? "rgba(148,163,184,0.4)"
              : "rgba(148,163,184,0.7)",
          }}
        />

        {values.map((v, idx) => {
          const clamped = Math.max(0, Math.min(100, v));
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
            >
              <div className="flex-1 flex flex-col items-center justify-end">
                <span
                  className={`text-xs sm:text-sm xl:text-base font-semibold mb-1 ${valueColor}`}
                >
                  {clamped.toFixed(0)}%
                </span>
                <div
                  className="rounded-full"
                  style={{
                    width: "0.9rem",
                    maxWidth: "1.1rem",
                    height: `${clamped}%`,
                    backgroundColor: accent,
                    boxShadow: isDark
                      ? "0 4px 12px rgba(15,23,42,0.95)"
                      : "0 4px 12px rgba(148,163,184,0.9)",
                  }}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs xl:text-sm mt-1 ${labelColor}`}
              >
                E{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`flex justify-between text-[10px] sm:text-xs xl:text-sm ${footerColor}`}
      >
        <span>Elevadores 1–12</span>
        <span>Valores em % de carga (0–100%)</span>
      </div>
    </div>
  );
}

/** Donut de Motores */

type MotorsDonutProps = {
  active: number;
  alarm: number;
  off: number;
  isDark: boolean;
};

function MotorsDonut({ active, alarm, off, isDark }: MotorsDonutProps) {
  const total = Math.max(1, active + alarm + off);

  const aPerc = (active / total) * 100;
  const alPerc = (alarm / total) * 100;
  const offPerc = (off / total) * 100;

  const activeColor = "#22c55e";
  const alarmColor = "#f97316";
  const offColor = isDark ? "#64748b" : "#94a3b8";

  const bg = `conic-gradient(
    ${activeColor} 0deg ${aPerc * 3.6}deg,
    ${alarmColor} ${aPerc * 3.6}deg ${(aPerc + alPerc) * 3.6}deg,
    ${offColor} ${(aPerc + alPerc) * 3.6}deg 360deg
  )`;

  const donutBg = isDark ? "#020617" : "#f9fafb";
  const legendColor = isDark ? "text-slate-300" : "text-slate-700";

  return (
    <div className="flex flex-row items-center justify-center gap-6 xl:gap-10">
      <div
        className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 xl:w-44 xl:h-44 rounded-full"
        style={{ backgroundImage: bg }}
      >
        <div
          className="absolute inset-5 sm:inset-6 md:inset-7 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: donutBg }}
        >
          <span className="text-[11px] sm:text-xs font-medium tracking-wide text-slate-500 uppercase">
            Total
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-semibold">
            {total}
          </span>
        </div>
      </div>

      <div
        className={`flex flex-col gap-2 text-xs sm:text-sm md:text-base ${legendColor}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeColor }}
          />
          <span>
            <strong>Ativos:</strong> {active} ({aPerc.toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: alarmColor }}
          />
          <span>
            <strong>Falha/Alarme:</strong> {alarm} ({alPerc.toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: offColor }}
          />
          <span>
            <strong>Desligados:</strong> {off} ({offPerc.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

/** Helpers para os gauges semicirculares */

function useArcHelpers() {
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleDeg: number
  ) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const describeArc = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  return { polarToCartesian, describeArc };
}

/** Gauge FP (0.7–1.05) – com texto estilo LOW / NORMAL / HIGH */

type PowerFactorGaugeProps = {
  value: number;
  min?: number;
  max?: number;
  isDark: boolean;
};

function PowerFactorGauge({
  value,
  min = -1.05,
  max = 1,
  isDark,
}: PowerFactorGaugeProps) {
  const gradId = React.useId();
  const { polarToCartesian, describeArc } = useArcHelpers();

  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const angle = -90 + t * 180;
  const display = clamped.toFixed(2).replace(".", ",");

  const outerTrackColor = isDark ? "#1f2937" : "#e5e7eb";
  const baseColor = isDark ? "#020617" : "#f9fafb";
  const pointerColor = isDark ? "#f9fafb" : "#111827";
  const valueBg = isDark
    ? "bg-slate-200 text-slate-900"
    : "bg-slate-900 text-slate-50";
  const labelColor = isDark ? "text-slate-300" : "text-slate-700";

  const cx = 200;
  const cy = 200;
  const rOuter = 160;
  const rBase = 120;
  const pointerLen = rBase * 0.9;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

  const labelRadius = rOuter + 24;
  const leftAngle = -65;
  const centerAngle = 0;
  const rightAngle = 65;

  const leftPos = polarToCartesian(cx, cy, labelRadius, leftAngle);
  const centerPos = polarToCartesian(cx, cy, labelRadius, centerAngle);
  const rightPos = polarToCartesian(cx, cy, labelRadius, rightAngle);

  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <svg
        viewBox="0 0 400 280"
        className="w-40 h-auto sm:w-48 xl:w-56"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="40"
            y1="200"
            x2="360"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <path
          d={arcPathOuter}
          stroke={outerTrackColor}
          strokeWidth={36}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathOuter}
          stroke={`url(#${gradId})`}
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathBase}
          stroke={baseColor}
          strokeWidth={48}
          fill="none"
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={pointerTip.x}
          y2={pointerTip.y}
          stroke={pointerColor}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={10} fill={pointerColor} />

        <text
          x={leftPos.x}
          y={leftPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          className="font-semibold fill-rose-500"
          transform={`rotate(${leftAngle + 0}, ${leftPos.x - 5}, ${
            leftPos.y + 5
          })`}
        >
          CRÍTICO
        </text>

        <text
          x={centerPos.x}
          y={centerPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          className="font-semibold fill-emerald-500"
        >
          IDEAL
        </text>

        <text
          x={rightPos.x}
          y={rightPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          className="font-semibold fill-rose-500"
          transform={`rotate(${rightAngle - 0}, ${rightPos.x + 5}, ${
            rightPos.y + 5
          })`}
        >
          CRÍTICO
        </text>
      </svg>

      <div className="flex flex-col items-center -mt-1">
        <div
          className={`px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold shadow-md ${valueBg}`}
        >
          {display}
        </div>
        <span
          className={`mt-2 text-xs sm:text-sm uppercase tracking-wide ${labelColor}`}
        >
          FP
        </span>
      </div>
    </div>
  );
}

/** Gauge Potência Aparente (0–max kVA) */

type ApparentPowerGaugeProps = {
  value: number;
  max: number;
  isDark: boolean;
  title?: string;
  subtitle?: string;
  titleInside?: boolean;
};

function ApparentPowerGauge({
  value,
  max,
  isDark,
  title,
  subtitle,
  titleInside = false,
}: ApparentPowerGaugeProps) {
  const gradId = React.useId();
  const { polarToCartesian, describeArc } = useArcHelpers();

  const min = 0;
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const angle = -90 + t * 180;

  const displayValue = clamped.toFixed(0);
  const pct = ((clamped / max) * 100).toFixed(0);

  const outerTrackColor = isDark ? "#1f2937" : "#e5e7eb";
  const baseColor = isDark ? "#020617" : "#f9fafb";
  const pointerColor = isDark ? "#f9fafb" : "#111827";
  const valueBg = isDark
    ? "bg-slate-100 text-slate-900"
    : "bg-slate-900 text-slate-50";
  const labelColor = isDark ? "text-slate-300" : "text-slate-700";

  const cx = 200;
  const cy = 200;
  const rOuter = 160;
  const rBase = 120;
  const pointerLen = rBase * 0.9;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

  const labelRadius = rOuter + 24;
  const leftAngle = -65;
  const centerAngle = 0;
  const rightAngle = 65;

  const leftPos = polarToCartesian(cx, cy, labelRadius, leftAngle);
  const centerPos = polarToCartesian(cx, cy, labelRadius, centerAngle);
  const rightPos = polarToCartesian(cx, cy, labelRadius, rightAngle);

  return (
    <div className="flex flex-col items-center gap-3 px-4">
      <div className="relative">
        <svg
          viewBox="0 0 400 280"
          className="w-40 h-auto sm:w-48 xl:w-56"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="40"
              y1="200"
              x2="360"
              y2="200"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path
            d={arcPathOuter}
            stroke={outerTrackColor}
            strokeWidth={36}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={arcPathOuter}
            stroke={`url(#${gradId})`}
            strokeWidth={28}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={arcPathBase}
            stroke={baseColor}
            strokeWidth={52}
            fill="none"
            strokeLinecap="round"
          />

          <line
            x1={cx}
            y1={cy}
            x2={pointerTip.x}
            y2={pointerTip.y}
            stroke={pointerColor}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={10} fill={pointerColor} />

          <text
            x={leftPos.x}
            y={leftPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            className="font-semibold fill-emerald-500"
            transform={`rotate(${leftAngle + 0}, ${leftPos.x - 5}, ${
              leftPos.y + 5
            })`}
          >
            IDEAL
          </text>

          <text
            x={centerPos.x}
            y={centerPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            className="font-semibold fill-amber-500"
          >
            ATENÇÃO
          </text>

          <text
            x={rightPos.x}
            y={rightPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            className="font-semibold fill-rose-500"
            transform={`rotate(${rightAngle - 0}, ${rightPos.x + 5}, ${
              rightPos.y + 5
            })`}
          >
            CRÍTICO
          </text>

          <circle cx={cx} cy={cy} r={10} fill={pointerColor} />
        </svg>

        {titleInside && (
          <div
            className="absolute left-1/2"
            style={{ top: "48%", transform: "translate(-50%, -50%)" }}
          >
            <div className="text-center">
              {title && (
                <div
                  className={`text-[11px] sm:text-sm uppercase tracking-wide ${labelColor}`}
                >
                  {title}
                </div>
              )}
              <div
                className={`px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold shadow-md ${valueBg} mt-1`}
              >
                {displayValue} kVA
              </div>
              <div className={`mt-1 text-xs sm:text-sm ${labelColor}`}>
                {pct}% da capacidade
              </div>
              {subtitle && (
                <div className={`text-xs sm:text-sm mt-1 ${labelColor}`}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!titleInside && (
        <div className="flex flex-col items-center -mt-1">
          <div
            className={`px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold shadow-md ${valueBg}`}
          >
            {displayValue} kVA
          </div>
          <span className={`mt-2 text-xs sm:text-sm ${labelColor}`}>
            {pct}% da capacidade
          </span>
        </div>
      )}
    </div>
  );
}

/** Card de Temperatura com cor dinâmica */

type TemperatureCardProps = {
  label: string;
  value: number | null;
  isDark: boolean;
};

function getTemperatureClasses(temp: number | null, isDark: boolean) {
  const cardBase =
    "rounded-2xl border shadow-sm px-4 py-3 sm:px-5 sm:py-3 xl:px-6 xl:py-3 flex flex-col flex-1";

  if (temp === null) {
    return `${cardBase} ${
      isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
    }`;
  }

  if (temp > 50) {
    return `${cardBase}  ${
      isDark ? "bg-rose-800 border-rose-600" : "bg-rose-600 border-rose-500"
    }`;
  }
  if (temp > 40) {
    return `${cardBase} ${
      isDark
        ? "bg-rose-900/50 border-rose-700"
        : "bg-rose-100 border-rose-300"
    }`;
  }
  if (temp > 35) {
    return `${cardBase} ${
      isDark
        ? "bg-amber-900/50 border-amber-700"
        : "bg-amber-100 border-amber-300"
    }`;
  }

  return `${cardBase} ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;
}

function TemperatureCard({ label, value, isDark }: TemperatureCardProps) {
  const cardClasses = getTemperatureClasses(value, isDark);
  const textColor =
    value === null
      ? ""
      : value > 50
      ? isDark
        ? "text-white"
        : "text-white"
      : value > 40
      ? isDark
        ? "text-amber-300"
        : "text-amber-700"
      : "";

  return (
    <div className={cardClasses}>
      <header className="flex items-center justify-between mb-1">
        <h2 className="text-sm sm:text-base xl:text-lg font-semibold tracking-tight">
          {label}
        </h2>
      </header>
      <div className="flex-1 flex items-center justify-start">
        <span className={`text-2xl xl:text-3xl font-semibold ${textColor}`}>
          {value !== null ? `${value.toFixed(1)} °C` : "--.- °C"}
        </span>
      </div>
    </div>
  );
}

/** ==================== PAGE PRINCIPAL ==================== */

export function ManagementPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeFmt = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const rootClass = isDark
    ? "min-h-screen w-full px-4 sm:px-6 pb-2 pt-2 bg-slate-950 text-slate-50"
    : "min-h-screen w-full px-4 sm:px-6 pb-2 pt-2 bg-slate-100 text-slate-900";

  const cardBase =
    "rounded-2xl border shadow-sm px-4 py-3 sm:px-5 sm:py-3 xl:px-6 xl:py-3 flex flex-col";
  const cardDark = "bg-slate-900/70 border-slate-800";
  const cardLight = "bg-white border-slate-200";

  const subtleTextClass = isDark ? "text-slate-400" : "text-slate-700";

  // ====== NOVO: busca eficiências do back-end ======
  const { productive, energy } = useEfficiency({ intervalMs: 5000 });

  // Converte overallEfficiency (0–1) para 0–100%.
  const productiveEfficiency = (() => {
    const val = productive?.overallEfficiency;
    if (typeof val === "number" && !Number.isNaN(val)) {
      return Math.max(0, Math.min(100, val * 100));
    }
    // fallback se o back não responder
    return 72;
  })();

  const energyEfficiency = (() => {
    const val = energy?.overallEfficiency;
    if (typeof val === "number" && !Number.isNaN(val)) {
      return Math.max(0, Math.min(100, val * 100));
    }
    // fallback: complementar da produtiva, só para não quebrar
    return 100 - productiveEfficiency;
  })();

  // ====== MOCKS QUE AINDA NÃO FORAM SUBSTITUÍDOS POR TAGS ======
  const mockElevators = [80, 55, 63, 40, 95, 70, 35, 20, 50, 60, 45, 30];
  const mockMotors = { active: 10, alarm: 10, off: 30 };

  const mockFp1 = 0.93;
  const mockFp2 = 0.88;

  const mockApparent1 = 650;
  const mockApparent2 = 820;

  const mockTemp1 = 47.1;
  const mockTemp2 = 52.3;

  const timeClass = isDark
    ? "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-50"
    : "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-900";

  const dateClass = isDark
    ? "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-100"
    : "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-800";

  return (
    <div className={rootClass}>
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="grid grid-cols-1 gap-3 lg:gap-4 xl:grid-cols-6">
          {/* Eficiência Produtiva */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-2 min-h-[165px]`}
          >
            <header className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Eficiência Produtiva
              </h2>
              <span
                className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
              >
                Geral
              </span>
            </header>
            <div className="flex-1 flex items-center justify-center ">
              <EfficiencyDonut
                value={productiveEfficiency}
                isDark={isDark}
                description="Indicador geral de eficiência dos elevadores e redlers."
              />
            </div>
          </section>

          {/* Eficiência Energética */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-2 min-h-[165px]`}
          >
            <header className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Eficiência Energética
              </h2>
              <span
                className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
              >
                Geral
              </span>
            </header>
            <div className="flex-1 flex items-center justify-center">
              <EfficiencyDonut
                value={energyEfficiency}
                isDark={isDark}
                description="Indicador geral de eficiência de todos os motores."
              />
            </div>
          </section>

          {/* Motores */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-2 min-h-[190px]`}
          >
            <header className="flex items-center justify-between mb-2">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                Motores
              </h2>
              <span
                className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
              >
                Geral
              </span>
            </header>

            <div className="flex-1 flex items-center justify-center">
              <MotorsDonut
                active={mockMotors.active}
                alarm={mockMotors.alarm}
                off={mockMotors.off}
                isDark={isDark}
              />
            </div>
          </section>

          {/* Elevadores */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-3`}
          >
            <header className="flex items-center justify-between mb-2">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Percentual de carga dos elevadores (1–12)
              </h2>
              <span
                className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
              >
                Tempo real
              </span>
            </header>
            <ElevatorsChart values={mockElevators} isDark={isDark} />
          </section>

          {/* Temperaturas */}
          <section className="flex flex-col gap-3 xl:col-span-1">
            <TemperatureCard
              label="Temperatura (CCM 1)"
              value={mockTemp1}
              isDark={isDark}
            />
            <TemperatureCard
              label="Temperatura (CCM 2)"
              value={mockTemp2}
              isDark={isDark}
            />
          </section>

          {/* Alarmes */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } min-h-[190px]`}
          >
            <header className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Alarmes
              </h2>
            </header>

            {/* Área rolável para não quebrar o layout quando tiver muitos alarmes */}
            <div className="flex-1 min-h-0 mt-1 relative">
              <div className="h-full max-h-40 flex flex-col gap-2 text-sm xl:text-base overflow-y-auto pr-1">
                <div className="font-semibold text-rose-500">
                  • Falha no motor do elevador E5
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
                <div className="font-medium text-amber-500">
                  • Temperatura alta no CCM 2
                </div>
              </div>

              {/* Fade + dica de scroll */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 flex items-end justify-center">
                <div
                  className={`w-full h-full ${
                    isDark
                      ? "bg-gradient-to-t from-slate-900/95 to-transparent"
                      : "bg-gradient-to-t from-white to-transparent"
                  }`}
                />
                <span className="absolute mb-1 text-[10px] uppercase tracking-wide text-slate-400">
                  Role para ver mais
                </span>
              </div>
            </div>
          </section>

          {/* Consumo total */}
          <section className={`${cardBase} ${isDark ? cardDark : cardLight}`}>
            <header className="mb-2">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Consumo total
              </h2>
            </header>

            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span
                    className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
                  >
                    CCM 1
                  </span>
                  <p className="text-3xl xl:text-4xl font-semibold">
                    12345 kWh
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Zerar
                </button>
              </div>

              <div className="border-t border-slate-200/60 dark:border-slate-800/70 pt-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span
                    className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
                  >
                    CCM 2
                  </span>
                  <p className="text-3xl xl:text-4xl font-semibold">
                    67890 kWh
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Zerar
                </button>
              </div>
            </div>

            <p
              className={`mt-2 text-[11px] sm:text-xs xl:text-sm leading-snug ${subtleTextClass}`}
            >
              Consumo acumulado individual por CCM desde o último reset.
            </p>
          </section>

          {/* Potência aparente */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-3`}
          >
            <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight text-center mb-2">
              Potência aparente
            </h2>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="w-full flex flex-col items-center">
                <span
                  className={`text-[8px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 1 · Trafo 1000 kVA
                </span>
                <ApparentPowerGauge
                  value={mockApparent1}
                  max={1000}
                  isDark={isDark}
                />
              </div>
              <div className="w-full flex flex-col items-center">
                <span
                  className={`text-[8px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 2 · Trafo 1200 kVA
                </span>
                <ApparentPowerGauge
                  value={mockApparent2}
                  max={1200}
                  isDark={isDark}
                />
              </div>
            </div>
            <p
              className={`text-[11px] sm:text-xs xl:text-sm ${subtleTextClass}`}
            >
              Gauges mostram a potência aparente atual em relação à capacidade
              do trafo de cada CCM.
            </p>
          </section>

          {/* Fator de potência */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-3`}
          >
            <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight text-center mb-2">
              Fator de potência
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 1
                </span>
                <PowerFactorGauge value={mockFp1} isDark={isDark} />
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 2
                </span>
                <PowerFactorGauge value={mockFp2} isDark={isDark} />
              </div>
            </div>
          </section>
        </div>

        {/* Data / hora */}
        <div className="mt-2 flex justify-end">
          <div className="text-right leading-tight">
            <div className={timeClass}>{timeFmt.format(now)}</div>
            <div className={dateClass}>{dateFmt.format(now)} (AMT)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
