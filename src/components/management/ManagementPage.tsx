// src/components/management/ManagementPage.tsx
import React from "react";
import { useTheme } from "../../theme/ThemeContext";

/** ==================== COMPONENTES VISUAIS ==================== */
/** Donut de eficiência: 0–100% */

type EfficiencyDonutProps = {
  value: number; // 0–100
  isDark: boolean;
};

function EfficiencyDonut({ value, isDark }: EfficiencyDonutProps) {
  const clamped = Math.max(0, Math.min(100, value));
  // Para não “estourar” o círculo quando for 100%, desenhamos até ~99.5%
  const visual = Math.min(clamped, 99.5);
  const fillColor = isDark ? "#22c55e" : "#16a34a";
  const trackColor = isDark ? "#1e293b" : "#e5e7eb";
  const bgColor = isDark ? "#020617" : "#f9fafb";

  const bg = `conic-gradient(
    ${fillColor} 0deg ${visual * 3.6}deg,
    ${trackColor} ${visual * 3.6}deg 360deg
  )`;

  return (
    <div className="flex flex-col items-center justify-center gap-3 h-full">
      <div
        className="relative w-32 h-32 sm:w-36 sm:h-36 xl:w-40 xl:h-40 rounded-full"
        style={{ backgroundImage: bg }}
      >
        <div
          className="absolute inset-5 sm:inset-6 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <span className="text-[11px] sm:text-xs tracking-[0.18em] uppercase text-slate-500">
            Eficiência
          </span>
          <span className="text-3xl sm:text-4xl xl:text-5xl font-semibold">
            {clamped.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="text-[11px] sm:text-xs text-slate-500 text-center">
        Indicador global de eficiência dos equipamentos.
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
                <span className="text-xs sm:text-sm xl:text-base text-slate-700 font-semibold mb-1">
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
              <span className="text-[10px] sm:text-xs xl:text-sm text-slate-500 mt-1">
                E{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] sm:text-xs xl:text-sm text-slate-500">
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

  return (
    <div className="flex flex-row items-center justify-center gap-6 xl:gap-10">
      {/* Donut maior */}
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

      {/* Legenda ao lado, com números e % */}
      <div className="flex flex-col gap-2 text-xs sm:text-sm md:text-[18px] text-slate-600">
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

/** Gauge FP (0.7–1.05) – maior */

type PowerFactorGaugeProps = {
  value: number;
  min?: number;
  max?: number;
};

function PowerFactorGauge({
  value,
  min = 0.7,
  max = 1.05,
}: PowerFactorGaugeProps) {
  const gradId = React.useId();
  const { polarToCartesian, describeArc } = useArcHelpers();

  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const angle = -90 + t * 180;
  const display = clamped.toFixed(2).replace(".", ",");

  const cx = 100;
  const cy = 100;
  const rOuter = 80;
  const rBase = 55;
  const pointerLen = 70;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 130" className="w-36 h-auto sm:w-44 xl:w-52">
        <defs>
          <linearGradient
            id={gradId}
            x1="20"
            y1="100"
            x2="180"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <path
          d={arcPathOuter}
          stroke="#e5e7eb"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathOuter}
          stroke={`url(#${gradId})`}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathBase}
          stroke="#f9fafb"
          strokeWidth={24}
          fill="none"
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={pointerTip.x}
          y2={pointerTip.y}
          stroke="#111827"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#111827" />
      </svg>

      <div className="flex flex-col items-center -mt-2">
        <div className="px-4 py-1.5 rounded-full bg-slate-900 text-slate-50 text-sm sm:text-base font-semibold shadow-md">
          {display}
        </div>
        <span className="mt-1 text-[11px] text-slate-600 uppercase tracking-wide">
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
};

function ApparentPowerGauge({ value, max }: ApparentPowerGaugeProps) {
  const gradId = React.useId();
  const { polarToCartesian, describeArc } = useArcHelpers();

  const min = 0;
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const angle = -90 + t * 180;

  const displayValue = clamped.toFixed(0);
  const pct = ((clamped / max) * 100).toFixed(0);

  const cx = 100;
  const cy = 100;
  const rOuter = 80;
  const rBase = 55;
  const pointerLen = 70;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 130" className="w-36 h-auto sm:w-44 xl:w-52">
        <defs>
          <linearGradient
            id={gradId}
            x1="20"
            y1="100"
            x2="180"
            y2="100"
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
          stroke="#e5e7eb"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathOuter}
          stroke={`url(#${gradId})`}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPathBase}
          stroke="#f9fafb"
          strokeWidth={26}
          fill="none"
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={pointerTip.x}
          y2={pointerTip.y}
          stroke="#111827"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#111827" />
      </svg>

      <div className="flex flex-col items-center -mt-1">
        <div className="px-4 py-1.5 rounded-full bg-slate-900 text-slate-50 text-sm sm:text-base font-semibold shadow-md">
          {displayValue} kVA
        </div>
        <span className="mt-1 text-[11px] sm:text-xs text-slate-600">
          {pct}% da capacidade
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

  const mockEfficiency = 72;
  const mockElevators = [80, 55, 63, 40, 95, 70, 35, 20, 50, 60, 45, 30];
  const mockMotors = { active: 14, alarm: 2, off: 4 };

  const mockFp1 = 0.93;
  const mockFp2 = 0.88;

  const mockApparent1 = 650;
  const mockApparent2 = 820;

  const timeClass = isDark
    ? "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-50"
    : "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-900";

  const dateClass = isDark
    ? "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-100"
    : "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-800";

  return (
    <div className={rootClass}>
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="grid gap-3 lg:gap-4 xl:grid-cols-5">
          {/* Eficiência */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-2 min-h-[165px]`}
          >
            <header className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Eficiência
              </h2>
              <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500">
                Geral
              </span>
            </header>
            <div className="flex-1 flex items-center justify-center">
              <EfficiencyDonut value={mockEfficiency} isDark={isDark} />
            </div>
          </section>

          {/* Temperaturas */}
          <section className="flex flex-col gap-3 xl:col-span-1">
            <div className={`${cardBase} ${isDark ? cardDark : cardLight}`}>
              <header className="flex items-center justify-between mb-1">
                <h2 className="text-sm sm:text-base xl:text-lg font-semibold tracking-tight">
                  Temperatura Painel (CCM 1)
                </h2>
              </header>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-2xl xl:text-3xl font-semibold">
                  --.- °C
                </span>
              </div>
            </div>

            <div className={`${cardBase} ${isDark ? cardDark : cardLight}`}>
              <header className="flex items-center justify-between mb-1">
                <h2 className="text-sm sm:text-base xl:text-lg font-semibold tracking-tight">
                  Temperatura Painel (CCM 2)
                </h2>
              </header>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-2xl xl:text-3xl font-semibold">
                  --.- °C
                </span>
              </div>
            </div>
          </section>

          {/* Motores */}
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
    <span className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
      Total
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
              <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500">
                Tempo real
              </span>
            </header>
            <ElevatorsChart values={mockElevators} isDark={isDark} />
          </section>

          {/* Alarmes */}
          <section className={`${cardBase} ${isDark ? cardDark : cardLight}`}>
            <header className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight">
                Alarmes
              </h2>
            </header>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm xl:text-base text-slate-500 text-center">
                Nenhum alarme ativo. (lista geral aqui)
              </span>
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
                  <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500">
                    CCM 1
                  </span>
                  <p className="text-3xl xl:text-4xl font-semibold">XX kWh</p>
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
                  <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500">
                    CCM 2
                  </span>
                  <p className="text-3xl xl:text-4xl font-semibold">XX kWh</p>
                </div>
                <button
                  type="button"
                  className="text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Zerar
                </button>
              </div>
            </div>

            <p className="mt-2 text-[11px] sm:text-xs xl:text-sm text-slate-500 leading-snug">
              Consumo acumulado individual por CCM desde o último reset. Podemos
              adicionar um total geral aqui embaixo se desejar.
            </p>
          </section>

          {/* Potência aparente */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-3`}
          >
            <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight mb-3">
              Potência aparente
            </h2>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-1 place-items-center">
              <div className="w-full flex flex-col items-center">
                <span className="self-start text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500 mb-1">
                  CCM 1 · Trafo 1000 kVA
                </span>
                <ApparentPowerGauge value={mockApparent1} max={1000} />
              </div>

              <div className="w-full flex flex-col items-center">
                <span className="self-start text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500 mb-1">
                  CCM 2 · Trafo 1200 kVA
                </span>
                <ApparentPowerGauge value={mockApparent2} max={1200} />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs xl:text-sm text-slate-500">
              Gauges mostram a potência aparente atual em relação à capacidade
              do trafo de cada CCM.
            </p>
          </section>

          {/* Fator de potência */}
          <section
            className={`${cardBase} ${
              isDark ? cardDark : cardLight
            } xl:col-span-2`}
          >
            <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight mb-3">
              Fator de potência
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500 mb-1 self-start">
                  CCM 1
                </span>
                <PowerFactorGauge value={mockFp1} />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide text-slate-500 mb-1 self-start">
                  CCM 2
                </span>
                <PowerFactorGauge value={mockFp2} />
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
