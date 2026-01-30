// src/components/management/ManagementPage.tsx
import React from "react";
import { useTheme } from "../../theme/ThemeContext";
import { useMultiCcmTags } from "../../hooks/useMultiCcmTags";
import {
  getElevatorsLoad,
  getEnergyEfficiency,
  getProductiveEfficiency,
} from "../../api/efficiency";
import {
  getConsumptionResetDate,
  postResetConsumption,
} from "../../api/consumption";

/** ==================== TIPAGENS AUXILIARES ==================== */

type AlarmSeverity = "EMERGENCY" | "HIGH" | "MEDIUM";

type AlarmItem = {
  id: string;
  label: string;
  detail?: string;
  severity: AlarmSeverity;
};

// resposta da API de eficiência energética
type EnergyEfficiencyResponse = {
  overallLoadPercentage: number; // 0–1
  totalActiveCurrent: number;
  totalNominalCurrentOfActives: number;
  activeMotorsCount: number;
  activeMotorNames: string[];
};

// resposta da API de eficiência produtiva
type ProductiveEfficiencyResponse = {
  overallEfficiency: number; // 0–1
  totalActiveCurrent: number;
  totalNominalCurrentOfActives: number;
  activeProductiveMotorsCount: number;
  activeMotorNames: string[];
};

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
      <div className="relative flex-1 flex items-end gap-1 sm:gap-4">
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

/** Donut de Motores – TODOS os CCMs */

type MotorsDonutProps = {
  active: number;
  alarm: number;
  off: number;
  isDark: boolean;
};

function MotorsDonut({ active, alarm, off, isDark }: MotorsDonutProps) {
  const total = Math.max(1, active + alarm + off);

  const ligPerc = (active / total) * 100;
  const alPerc = (alarm / total) * 100;
  const offPerc = (off / total) * 100;

  const activeColor = "#22c55e";
  const alarmColor = "#f97316";
  const offColor = isDark ? "#64748b" : "#94a3b8";

  const bg = `conic-gradient(
    ${activeColor} 0deg ${ligPerc * 3.6}deg,
    ${alarmColor} ${ligPerc * 3.6}deg ${(ligPerc + alPerc) * 3.6}deg,
    ${offColor} ${(ligPerc + alPerc) * 3.6}deg 360deg
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
            <strong>Ligados:</strong> {active} ({ligPerc.toFixed(0)}%)
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

/** Gauge FP */

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

  const pointerLen = rOuter - 10;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

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

        {/* trilho externo + gradiente */}
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

        {/* base branca */}
        <path
          d={arcPathBase}
          stroke={baseColor}
          strokeWidth={48}
          fill="none"
          strokeLinecap="round"
        />

        {/* ponteiro maior */}
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

/** Gauge Potência Aparente */

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

  // Gráfico vai até 140% da capacidade nominal
  const gaugeMax = max * 1.4;
  const min = 0;
  const clampedVisual = Math.max(min, Math.min(gaugeMax, value));
  const t = (clampedVisual - min) / (gaugeMax - min);
  const angle = -90 + t * 180;

  const displayValue = value.toFixed(0);
  const pct = ((value / max) * 100).toFixed(0);

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

  const pointerLen = rOuter - 10;

  const arcPathOuter = describeArc(cx, cy, rOuter, -90, 90);
  const arcPathBase = describeArc(cx, cy, rBase, -90, 90);
  const pointerTip = polarToCartesian(cx, cy, pointerLen, angle);

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
              <stop offset="65%" stopColor="#22c55e" />
              <stop offset="72%" stopColor="#eab308" />
              <stop offset="92%" stopColor="#eab308" />
              <stop offset="96%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* trilho + gradiente */}
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

          {/* base branca */}
          <path
            d={arcPathBase}
            stroke={baseColor}
            strokeWidth={52}
            fill="none"
            strokeLinecap="round"
          />

          {/* ponteiro maior */}
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

/** Card de Temperatura */

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
      ? "text-white"
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

/** ==================== FUNÇÕES AUXILIARES DE LÓGICA ==================== */

// Soma motores dos DOIS CCMs (aceita Mx_S/F, CCM1_Mx_S/F, CCM2_Mx_S/F)
function computeMotorsSummary(values: Record<string, unknown>) {
  const groups = new Map<string, { s?: boolean; f?: boolean }>();

  for (const key of Object.keys(values ?? {})) {
    // opcionalmente começa com CCM1_ ou CCM2_
    const match = /^(?:(CCM[12]_))?M(\d+)_([SF])$/.exec(key);
    if (!match) continue;

    const prefix = match[1] ?? ""; // "" ou "CCM1_" / "CCM2_"
    const id = match[2]; // "1", "2", ...
    const suffix = match[3] as "S" | "F";

    const groupKey = `${prefix}${id}`; // ex: "1", "CCM1_1", "CCM2_1"
    const current = groups.get(groupKey) ?? {};
    const raw = (values as any)[key];

    if (suffix === "S") current.s = isTrue(raw);
    if (suffix === "F") current.f = isTrue(raw);

    groups.set(groupKey, current);
  }

  let active = 0;
  let alarm = 0;
  let off = 0;

  for (const motor of groups.values()) {
    const hasAlarm = motor.f === true;
    const isOn = motor.s === true;

    if (hasAlarm) {
      alarm++;
    } else if (isOn) {
      active++;
    } else {
      off++;
    }
  }

  return { active, alarm, off };
}

function pickNumber(
  values: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const v = values?.[key];
    if (typeof v === "number") {
      return v;
    }
  }
  return null;
}

function formatResetTooltip(ts: string | null | undefined) {
  if (!ts) return "Nenhum reset registrado";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "Último reset: data inválida";
  return `Último reset: ${d.toLocaleString("pt-BR")}`;
}

function isTrue(raw: unknown) {
  return raw === true || raw === 1 || raw === "1";
}

function buildAlarms(
  values: Record<string, number | boolean | undefined>
): AlarmItem[] {
  const prefixes = ["CCM1", "CCM2"] as const;
  const alarms: AlarmItem[] = [];

  prefixes.forEach((prefix) => {
    const ccmLabel = prefix === "CCM1" ? "CCM 1" : "CCM 2";
    const emergenciaAtiva = isTrue(values[`${prefix}_STATUS_EMERGENCIA`]);
    const faltaFase = isTrue(values[`${prefix}_STATUS_FALTA_FASE`]);
    const superAquecimento = isTrue(
      values[`${prefix}_STATUS_SUPER_AQUECIMENTO`]
    );

    if (emergenciaAtiva) {
      alarms.push({
        id: `${prefix}-emergencia`,
        label: `Emergência ativa (${ccmLabel})`,
        detail: "Comando de emergência acionado no CCM.",
        severity: "EMERGENCY",
      });
    }

    if (faltaFase) {
      alarms.push({
        id: `${prefix}-falta-fase`,
        label: `Falta de fase (${ccmLabel})`,
        detail: "Verificar alimentação das fases do CCM.",
        severity: "HIGH",
      });
    }

    if (superAquecimento) {
      alarms.push({
        id: `${prefix}-super-aquecimento`,
        label: `Superaquecimento (${ccmLabel})`,
        detail: "Temperatura elevada detectada no painel.",
        severity: "MEDIUM",
      });
    }
  });

  const severityWeight: Record<AlarmSeverity, number> = {
    EMERGENCY: 3,
    HIGH: 2,
    MEDIUM: 1,
  };

  return alarms.sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity]
  );
}

/** ==================== PAGE PRINCIPAL ==================== */

export function ManagementPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [now, setNow] = React.useState(() => new Date());

  // Eficiências vindas do back-end
  const [productiveEfficiencyPct, setProductiveEfficiencyPct] =
    React.useState<number | null>(null);
  const [energyEfficiencyPct, setEnergyEfficiencyPct] =
    React.useState<number | null>(null);

  const [energyEfficiencyInfo, setEnergyEfficiencyInfo] =
    React.useState<EnergyEfficiencyResponse | null>(null);
  const [productiveEfficiencyInfo, setProductiveEfficiencyInfo] =
    React.useState<ProductiveEfficiencyResponse | null>(null);

  const [elevatorsLoadPct, setElevatorsLoadPct] = React.useState<
    number[] | null
  >(null);
  const [efficiencyError, setEfficiencyError] =
    React.useState<string | null>(null);

  // Consumo – datas de reset
  const [resetCcm1, setResetCcm1] = React.useState<string | null>(null);
  const [resetCcm2, setResetCcm2] = React.useState<string | null>(null);
  const [consumptionLoading, setConsumptionLoading] = React.useState(false);
  const [consumptionError, setConsumptionError] =
    React.useState<string | null>(null);

  // Tags combinadas de todos os CCMs (e por CCM)
  const multiTags = useMultiCcmTags({ intervalMs: 1500 }) as any;
  const valuesMerged = (multiTags?.valuesMerged ??
    multiTags?.values ??
    {}) as Record<string, unknown>;
  const valuesByCcm = (multiTags?.valuesByCcm ??
    null) as Record<string, Record<string, unknown>> | null;
  const ccm1Values = (valuesByCcm?.ccm1 ?? {}) as Record<string, unknown>;
  const ccm2Values = (valuesByCcm?.ccm2 ?? {}) as Record<string, unknown>;

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Busca periódica das eficiências + elevadores
  React.useEffect(() => {
    let mounted = true;
    const intervalMs = 2000;

    async function fetchEfficiencies() {
      try {
        const [productive, energy, elevators] = await Promise.all([
          getProductiveEfficiency(),
          getEnergyEfficiency(),
          getElevatorsLoad(),
        ]);

        if (!mounted) return;

        // PRODUTIVA
        let prodBase: number | null = null;
        if (
          productive &&
          typeof (productive as any).overallEfficiency === "number"
        ) {
          prodBase = (productive as any).overallEfficiency;
          setProductiveEfficiencyInfo(
            productive as unknown as ProductiveEfficiencyResponse
          );
        } else if (productive && typeof (productive as any).value === "number") {
          prodBase = (productive as any).value;
          setProductiveEfficiencyInfo(null);
        } else {
          setProductiveEfficiencyInfo(null);
        }

        setProductiveEfficiencyPct(
          prodBase !== null ? prodBase * 100 : null
        );

        // ENERGÉTICA
        let energyBase: number | null = null;
        if (
          energy &&
          typeof (energy as any).overallLoadPercentage === "number"
        ) {
          energyBase = (energy as any).overallLoadPercentage; // 0–1
          setEnergyEfficiencyInfo(
            energy as unknown as EnergyEfficiencyResponse
          );
        } else if (energy && typeof (energy as any).value === "number") {
          energyBase = (energy as any).value;
          setEnergyEfficiencyInfo(null);
        } else {
          setEnergyEfficiencyInfo(null);
        }

        setEnergyEfficiencyPct(
          energyBase !== null ? energyBase * 100 : null
        );

        setElevatorsLoadPct(
          Array.isArray(elevators)
            ? elevators.map((e: any) =>
                typeof e.loadPercentage === "number" ? e.loadPercentage * 100 : 0
              )
            : null
        );

        setEfficiencyError(null);
      } catch (err: any) {
        if (!mounted) return;
        setEfficiencyError(
          err?.message ?? "Erro ao buscar dados de eficiência"
        );
      }
    }

    fetchEfficiencies();
    const timer = window.setInterval(fetchEfficiencies, intervalMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  // Busca inicial das datas de reset
  React.useEffect(() => {
    let mounted = true;
    async function fetchResetDates() {
      try {
        const [d1, d2] = await Promise.all([
          getConsumptionResetDate("ccm1"),
          getConsumptionResetDate("ccm2"),
        ]);

        if (!mounted) return;

        if (d1) setResetCcm1(d1.date ?? null);
        if (d2) {
          setResetCcm2(d2.date ?? null);
        }
      } catch {
        // Se der erro aqui, só não mostra tooltip; não quebra tela
      }
    }

    fetchResetDates();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleReset(ccm: "ccm1" | "ccm2") {
    try {
      setConsumptionLoading(true);
      setConsumptionError(null);

      await postResetConsumption(ccm);

      const dateInfo = await getConsumptionResetDate(ccm);

      if (dateInfo) {
        if (ccm === "ccm1") {
          setResetCcm1(dateInfo.date ?? null);
        } else {
          setResetCcm2(dateInfo.date ?? null);
        }
      }
    } catch (err: any) {
      setConsumptionError(
        err?.message ?? "Erro ao zerar consumo. Tente novamente."
      );
    } finally {
      setConsumptionLoading(false);
    }
  }

  const rootClass = isDark
    ? "min-h-screen w-full px-4 sm:px-6 pb-2 pt-2 bg-slate-950 text-slate-50"
    : "min-h-screen w-full px-4 sm:px-6 pb-2 pt-2 bg-slate-100 text-slate-900";

  const cardBase =
    "rounded-2xl border shadow-sm px-4 py-3 sm:px-5 sm:py-3 xl:px-6 xl:py-3 flex flex-col";
  const cardDark = "bg-slate-900/70 border-slate-800";
  const cardLight = "bg-white border-slate-200";

  const subtleTextClass = isDark ? "text-slate-400" : "text-slate-700";

  const timeClass = isDark
    ? "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-50"
    : "font-mono text-xl sm:text-2xl xl:text-3xl text-slate-900";

  const dateClass = isDark
    ? "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-100"
    : "text-[11px] sm:text-xs xl:text-sm capitalize text-slate-800";

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

  // 🔧 Resumo de motores baseado nas tags (TODOS os CCMs)
  const motorsSummary = React.useMemo(() => {
    // Se o hook expuser valuesByCcm (ccm1, ccm2...), usamos isso
    if (valuesByCcm && Object.keys(valuesByCcm).length > 0) {
      let active = 0;
      let alarm = 0;
      let off = 0;

      Object.entries(valuesByCcm).forEach(([ccmId, tagsObj]) => {
        if (!tagsObj) return;
        const tags = tagsObj as Record<string, unknown>;
        const groups = new Map<string, { s?: boolean; f?: boolean }>();

        for (const key of Object.keys(tags)) {
          // padrão do dashboard: Mxx_S / Mxx_F
          const match = /^M(\d+)_([SF])$/.exec(key);
          if (!match) continue;

          const id = match[1];
          const suffix = match[2] as "S" | "F";
          const groupKey = `${ccmId}-${id}`; // garante separar CCM1 e CCM2

          const current = groups.get(groupKey) ?? {};
          const raw = (tags as any)[key];

          if (suffix === "S") current.s = isTrue(raw);
          if (suffix === "F") current.f = isTrue(raw);

          groups.set(groupKey, current);
        }

        // conta para esse CCM
        for (const motor of groups.values()) {
          const hasAlarm = motor.f === true;
          const isOn = motor.s === true;

          if (hasAlarm) {
            alarm++;
          } else if (isOn) {
            active++;
          } else {
            off++;
          }
        }
      });

      return { active, alarm, off };
    }

    // fallback: lógica antiga em cima de values flatten
    return computeMotorsSummary(valuesMerged ?? {});
  }, [valuesByCcm, valuesMerged]);

  const motorsData = motorsSummary;

  const productiveValue = productiveEfficiencyPct ?? 0; // 0–100
  const energyValue = energyEfficiencyPct ?? 0; // 0–100
  const elevatorsValues = elevatorsLoadPct ?? Array(12).fill(0);

  // Valores das tags
  const consumo1 = pickNumber(ccm1Values, [
    "CCM1_CONSUMO_TOTAL",
    "CONSUMO1",
    "CONSUMO_TOTAL",
  ]);
  const consumo2 = pickNumber(ccm2Values, [
    "CCM2_CONSUMO_TOTAL",
    "CONSUMO2",
    "CONSUMO_TOTAL",
  ]);

  const fp1 =
    pickNumber(ccm1Values, ["CCM1_FATOR_POTENCIA", "FP", "FP1"]) ?? 0;

  const fp2 =
    pickNumber(ccm2Values, ["CCM2_FATOR_POTENCIA", "FP2", "FP"]) ?? 0;

  // CCM1 – aceita CCM1_POTENCIA ou PA_CCM1 ou PA1
  const kva1 =
    pickNumber(ccm1Values, ["CCM1_POTENCIA", "PA_CCM1", "PA1", "PA"]) ?? 0;

  // // CCM2 – aceita tanto CCM2_POTENCIA quanto PA
  const kva2 =
    pickNumber(ccm2Values, ["CCM2_POTENCIA", "PA2", "PA"]) ?? 0;

  const temp1 = pickNumber(ccm1Values, ["CCM1_TEMP_PAINEL", "TEMP_PAINEL"]);
  const temp2 = pickNumber(ccm2Values, ["CCM2_TEMP_PAINEL", "TEMP_PAINEL"]);

  const alarms = React.useMemo(
    () =>
      buildAlarms(
        (valuesMerged ?? {}) as Record<string, number | boolean | undefined>
      ),
    [valuesMerged]
  );
  const hasAlarms = alarms.length > 0;

  const resetTooltipCcm1 = formatResetTooltip(resetCcm1);
  const resetTooltipCcm2 = formatResetTooltip(resetCcm2);

  // descrição rica pra eficiência energética
  const energyDescription = efficiencyError
    ? `Erro: ${efficiencyError}`
    : energyEfficiencyInfo
    ? (() => {
        const info = energyEfficiencyInfo;
        return `Baseado em ${info.activeMotorsCount} motores ligados. Corrente total: ${info.totalActiveCurrent.toFixed(
          1
        )} A de ${info.totalNominalCurrentOfActives.toFixed(
          1
        )} A nominal.`;
      })()
    : "Indicador geral de eficiência de todos os motores.";

  // descrição rica pra eficiência produtiva
  const productiveDescription = efficiencyError
    ? `Erro: ${efficiencyError}`
    : productiveEfficiencyInfo
    ? (() => {
        const info = productiveEfficiencyInfo;
        return `Baseado em ${info.activeProductiveMotorsCount} motores produtivos ligados. Corrente total: ${info.totalActiveCurrent.toFixed(
          1
        )} A de ${info.totalNominalCurrentOfActives.toFixed(
          1
        )} A nominal.`;
      })()
    : "Indicador geral de eficiência dos elevadores e redlers.";

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
                value={productiveValue}
                isDark={isDark}
                description={productiveDescription}
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
                Economia Energética
              </h2>
              <span
                className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass}`}
              >
                Geral
              </span>
            </header>
            <div className="flex-1 flex items-center justify-center">
              <EfficiencyDonut
                value={energyValue}
                isDark={isDark}
                description={energyDescription}
              />
            </div>
          </section>

          {/* Motores (todos os CCMs) */}
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
                active={motorsData.active}
                alarm={motorsData.alarm}
                off={motorsData.off}
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
            <ElevatorsChart values={elevatorsValues} isDark={isDark} />
          </section>

          {/* Temperaturas */}
          <section className="flex flex-col gap-3 xl:col-span-1">
            <TemperatureCard
              label="Temperatura (CCM 1)"
              value={temp1}
              isDark={isDark}
            />
            <TemperatureCard
              label="Temperatura (CCM 2)"
              value={temp2}
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

            <div className="flex-1 min-h-0 mt-1 relative">
              {hasAlarms ? (
                <>
                  <div className="h-full max-h-40 flex flex-col gap-2 text-sm xl:text-base overflow-y-auto pr-1">
                    {alarms.map((alarm) => {
                      const base =
                        "flex items-start gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm";

                      const styleBySeverity = (() => {
                        switch (alarm.severity) {
                          case "EMERGENCY":
                            return isDark
                              ? "border-rose-500/40 bg-rose-950/70 text-rose-100"
                              : "border-rose-200 bg-rose-50 text-rose-900";
                          case "HIGH":
                            return isDark
                              ? "border-amber-500/40 bg-amber-950/40 text-amber-100"
                              : "border-amber-200 bg-amber-50 text-amber-900";
                          case "MEDIUM":
                          default:
                            return isDark
                              ? "border-sky-500/40 bg-sky-950/40 text-sky-100"
                              : "border-sky-200 bg-sky-50 text-sky-900";
                        }
                      })();

                      const dotColor = (() => {
                        switch (alarm.severity) {
                          case "EMERGENCY":
                            return isDark ? "bg-rose-400" : "bg-rose-500";
                          case "HIGH":
                            return isDark ? "bg-amber-400" : "bg-amber-500";
                          case "MEDIUM":
                          default:
                            return isDark ? "bg-sky-400" : "bg-sky-500";
                        }
                      })();

                      return (
                        <div
                          key={alarm.id}
                          className={`${base} ${styleBySeverity}`}
                        >
                          <span
                            className={`mt-1 h-2 w-2 rounded-full ${dotColor}`}
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{alarm.label}</div>
                            {alarm.detail && (
                              <div className="text-[11px] opacity-80">
                                {alarm.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
                </>
              ) : (
                <div
                  className={
                    isDark
                      ? "rounded-xl bg-emerald-900/60 px-4 py-2 text-sm text-emerald-100"
                      : "rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-900"
                  }
                >
                  Nenhum alarme ativo.
                </div>
              )}
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
                    {typeof consumo1 === "number" ? consumo1.toFixed(0) : "--"}{" "}
                    kWh
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReset("ccm1")}
                  disabled={consumptionLoading}
                  title={resetTooltipCcm1}
                  className="text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                    {typeof consumo2 === "number" ? consumo2.toFixed(0) : "--"}{" "}
                    kWh
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReset("ccm2")}
                  disabled={consumptionLoading}
                  title={resetTooltipCcm2}
                  className="text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Zerar
                </button>
              </div>
            </div>

            {consumptionError && (
              <p className="mt-2 text-[11px] sm:text-xs xl:text-sm text-rose-500">
                {consumptionError}
              </p>
            )}

            <p
              className={`mt-1 text-[11px] sm:text-xs xl:text-sm leading-snug ${subtleTextClass}`}
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
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg xl:text-xl font-semibold tracking-tight text-center">
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className={subtleTextClass}>Ideal (≤100%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className={subtleTextClass}>Atenção (100-120%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className={subtleTextClass}>Crítico (&gt;121%)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="w-full flex flex-col items-center">
                <span
                  className={`text-[8px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 1 · Trafo 750 kVA
                </span>
                <ApparentPowerGauge
                  value={kva1 as number}
                  max={750}
                  isDark={isDark}
                />
              </div>
              <div className="w-full flex flex-col items-center">
                <span
                  className={`text-[8px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 2 · Trafo 300 kVA
                </span>
                <ApparentPowerGauge
                  value={kva2 as number}
                  max={300}
                  isDark={isDark}
                />
              </div>
            </div>
            <p
              className={`text-[11px] sm:text-xs xl:text-sm ${subtleTextClass}`}
            >

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
            <div className="flex flex-col items-center mb-4">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className={subtleTextClass}>Ideal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className={subtleTextClass}>Atenção</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className={subtleTextClass}>Crítico</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 1
                </span>
                <PowerFactorGauge value={fp1 as number} isDark={isDark} />
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] sm:text-xs xl:text-sm uppercase tracking-wide ${subtleTextClass} mb-1`}
                >
                  CCM 2
                </span>
                <PowerFactorGauge value={fp2 as number} isDark={isDark} />
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
