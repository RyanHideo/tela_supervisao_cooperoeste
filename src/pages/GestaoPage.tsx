// src/pages/GestaoPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoLight from "../assets/sinapse-logo-horizontal.png";
import logoDark from "../assets/sinapse-logo-horizontal-escuro.png";
import { useMultiCcmTags } from "../hooks/useMultiCcmTags";
import { useTheme } from "../theme/ThemeContext";
import { MotorDonutCard } from "../components/dashboard/MotorDonutCard";
import { MotorLoadGauge } from "../components/motors/MotorLoadGauge";
import { logout } from "../auth/auth";

function formatNumber(value: number | undefined, decimals = 0, suffix = "") {
  if (value === undefined || Number.isNaN(value)) return "--";
  return `${value.toFixed(decimals)}${suffix}`;
}

function avg(values: (number | undefined)[]) {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (!filtered.length) return undefined;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function sum(values: (number | undefined)[]): number {
  return values.reduce<number>(
    (acc, v) => (typeof v === "number" ? acc + v : acc),
    0
  );
}

function getBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === 1.0;
}

export function GestaoPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const { values, ts, loading, error, warning } = useMultiCcmTags({
    intervalMs: 2000,
  });

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const getNumber = (tag: string) => {
    const raw = values[tag];
    return typeof raw === "number" ? raw : undefined;
  };

  const temperatures = [
    { label: "Temperatura CCM 1", value: getNumber("CCM1_TEMP_PAINEL") },
    { label: "Temperatura CCM 2", value: getNumber("CCM2_TEMP_PAINEL") },
  ];

  const fatorPotenciaMedio = avg([
    getNumber("CCM1_FATOR_POTENCIA"),
    getNumber("CCM2_FATOR_POTENCIA"),
  ]);
  const eficiencia = fatorPotenciaMedio
    ? Math.min(100, Math.max(0, fatorPotenciaMedio * 100))
    : undefined;

  const potenciaTotal = sum([
    getNumber("CCM1_POTENCIA"),
    getNumber("CCM2_POTENCIA"),
  ]);

  const consumoTotal = sum([
    getNumber("CCM1_CONSUMO_TOTAL"),
    getNumber("CCM2_CONSUMO_TOTAL"),
  ]);

  const motoresTotal = sum([
    getNumber("CCM1_MOTORES_TOTAL"),
    getNumber("CCM2_MOTORES_TOTAL"),
  ]);
  const motoresAtivos = sum([
    getNumber("CCM1_MOTORES_ATIVOS"),
    getNumber("CCM2_MOTORES_ATIVOS"),
  ]);
  const motoresFalha = sum([
    getNumber("CCM1_MOTORES_FALHA"),
    getNumber("CCM2_MOTORES_FALHA"),
  ]);
  const motoresDesligados =
    motoresTotal > 0
      ? Math.max(0, motoresTotal - motoresAtivos - motoresFalha)
      : sum([
          getNumber("CCM1_MOTORES_DESLIGADOS"),
          getNumber("CCM2_MOTORES_DESLIGADOS"),
        ]);

  const elevators = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const id = idx + 1;
      const suffix = `${String(id).padStart(2, "0")}`;
      const tags = [
        `CCM1_ELEVADOR_${suffix}_CARGA`,
        `CCM2_ELEVADOR_${suffix}_CARGA`,
        `ELEVADOR_${suffix}_CARGA`,
      ];
      const value = tags
        .map((tag) => getNumber(tag))
        .find((v) => typeof v === "number");
      return { id, value };
    });
  }, [values]);

  const alarmes = useMemo(() => {
    const list: { id: string; label: string; detail: string; severity: "HIGH" | "EMERGENCY" | "MEDIUM" }[] = [];
    (["CCM1", "CCM2"] as const).forEach((prefix) => {
      if (getBoolean(values[`${prefix}_STATUS_EMERGENCIA`])) {
        list.push({
          id: `${prefix}-emergencia`,
          label: `Emergência ativa (${prefix})`,
          detail: "Comando de emergência acionado no CCM.",
          severity: "EMERGENCY",
        });
      }
      if (getBoolean(values[`${prefix}_STATUS_FALTA_FASE`])) {
        list.push({
          id: `${prefix}-falta-fase`,
          label: `Falta de fase (${prefix})`,
          detail: "Verificar alimentação das fases do CCM.",
          severity: "HIGH",
        });
      }
      if (getBoolean(values[`${prefix}_STATUS_SUPER_AQUECIMENTO`])) {
        list.push({
          id: `${prefix}-super-aquecimento`,
          label: `Superaquecimento (${prefix})`,
          detail: "Temperatura elevada detectada no painel.",
          severity: "MEDIUM",
        });
      }
    });

    const weight = { EMERGENCY: 3, HIGH: 2, MEDIUM: 1 } as const;
    return list.sort((a, b) => weight[b.severity] - weight[a.severity]);
  }, [values]);

  const elevadorMedio = useMemo(
    () => avg(elevators.map((e) => e.value)),
    [elevators]
  );

  const elevadoresAtivos = elevators.filter((e) => e.value !== undefined).length;

  const alarmesCriticos = alarmes.filter(
    (alarm) => alarm.severity !== "MEDIUM"
  ).length;

  const barWidth = (value: number | undefined, max: number) => {
    const pct = value !== undefined ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return `${pct}%`;
  };

  const rootClass = isDark
    ? "min-h-screen bg-slate-950 text-slate-100"
    : "min-h-screen bg-slate-100 text-slate-900";
  const panelClass = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg"
    : "rounded-2xl border border-slate-200 bg-white shadow-sm";
  const accentGradient = isDark
    ? "bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-indigo-500/20"
    : "bg-gradient-to-r from-emerald-200/70 via-sky-200/70 to-indigo-200/70";

  const logo = isDark ? logoLight : logoDark;

  return (
    <div className={rootClass}>
      <header
        className={`border-b ${
          isDark ? "border-slate-800 bg-slate-950/90" : "border-slate-200 bg-white/90"
        } px-4 py-3`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sinapse" className="h-10 w-auto sm:h-14" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Gestão</p>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Visão Geral CooperOeste – CCMs Integrados
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {ts && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
                Última atualização: {new Date(ts).toLocaleTimeString()}
              </span>
            )}
            {warning && (
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-400">
                {warning}
              </span>
            )}
            {error && (
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-300">
                {error}
              </span>
            )}
            <button
              onClick={() => navigate("/ccm/ccm1")}
              className={
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors " +
                (isDark
                  ? "border-slate-700 text-slate-200 hover:border-emerald-400"
                  : "border-slate-300 text-slate-700 hover:border-emerald-500")
              }
            >
              Voltar para CCMs
            </button>
            <button
              onClick={toggleTheme}
              className={
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors " +
                (isDark
                  ? "border-slate-700 text-slate-200 hover:border-amber-400"
                  : "border-slate-300 text-slate-700 hover:border-amber-500")
              }
            >
              {isDark ? "☀️ Claro" : "🌙 Escuro"}
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className={
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors " +
                (isDark
                  ? "border-slate-700 text-slate-200 hover:border-rose-400"
                  : "border-slate-300 text-slate-700 hover:border-rose-500")
              }
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        <section className={`grid gap-4 lg:grid-cols-12 ${accentGradient} p-4 ${panelClass}`}>
          {temperatures.map((item) => (
            <div key={item.label} className="lg:col-span-3 flex flex-col gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">Temperatura</p>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-tight">{item.label}</h3>
                <span className="text-xs text-emerald-200">Painel</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-emerald-100 drop-shadow-sm">
                  {formatNumber(item.value, 1, "°")}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400"
                      style={{ width: barWidth(item.value, 80) }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Teto seguro de 80 °C</p>
                </div>
              </div>
            </div>
          ))}

          <div className="lg:col-span-3 flex flex-col justify-between gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-sky-200">
              <span>Eficiência</span>
              <span>Média</span>
            </div>
            <div className="flex items-center gap-4">
              <EfficiencyDonut value={eficiencia ?? 0} isDark={isDark} />
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-semibold text-slate-200">Fator de potência médio</p>
                <p className="text-3xl font-black text-slate-50">
                  {formatNumber(fatorPotenciaMedio, 2)}
                </p>
                <p className="text-xs text-slate-400">Junção dos dois CCMs para uma única visão.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid gap-3">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
                <span>Potência</span>
                <span>kVA</span>
              </div>
              <p className="mt-2 text-4xl font-black text-slate-50">{formatNumber(potenciaTotal, 1, " kVA")}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                  style={{ width: barWidth(potenciaTotal, 1500) }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Soma das leituras dos dois CCMs.</p>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
                <span>Consumo</span>
                <span>kWh</span>
              </div>
              <p className="mt-2 text-4xl font-black text-slate-50">{formatNumber(consumoTotal, 0, " kWh")}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400"
                  style={{ width: barWidth(consumoTotal, 20000) }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Acumulado total exibido para o gestor.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className={`${panelClass} p-4 lg:col-span-2`}>
            <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Elevadores</p>
                <h3 className="text-xl font-semibold">Percentual de carga dos 12 elevadores</h3>
                <p className="text-xs text-slate-400">Fonte principal CCM1, espelhando para CCM2 quando disponível.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="rounded-full bg-slate-800 px-3 py-1">Monitorados: {formatNumber(elevators.length, 0)}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">Dados ativos: {formatNumber(elevadoresAtivos, 0)}</span>
              </div>
            </header>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {elevators.map((elevator) => (
                <div key={elevator.id} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                    <span>Elev. {String(elevator.id).padStart(2, "0")}</span>
                    <span className="font-semibold text-slate-200">
                      {elevator.value !== undefined ? `${elevator.value.toFixed(0)}%` : "--"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                      style={{ width: `${Math.max(0, Math.min(100, elevator.value ?? 0))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Percentual de carga em tempo real.</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`grid gap-4 ${panelClass} p-4`}>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Elevadores</p>
              <h3 className="text-lg font-semibold">Média de carga</h3>
              <span className="text-xs text-slate-400">Visual TV</span>
            </div>
            <div className="flex justify-center mt-2">
              <div className="w-full max-w-xs">
                <MotorLoadGauge percent={elevadorMedio ?? 0} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className={`${panelClass} p-4 lg:col-span-2`}>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Motores</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
                <p className="text-xs text-slate-400">Ativos</p>
                <p className="text-4xl font-black text-emerald-300">{formatNumber(motoresAtivos, 0)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
                <p className="text-xs text-slate-400">Falha</p>
                <p className="text-4xl font-black text-amber-300">{formatNumber(motoresFalha, 0)}</p>
              </div>
            </div>
            <div className="mt-3">
              <MotorDonutCard
                total={motoresTotal}
                ativos={motoresAtivos}
                falha={motoresFalha}
                desligados={motoresDesligados}
              />
            </div>
          </div>

          <div className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Alarmes</p>
                <h3 className="text-lg font-semibold">Visão Geral</h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-rose-100">
                  {alarmesCriticos} críticos
                </span>
                <span
                  className={`h-3 w-3 rounded-full ${
                    alarmes.length
                      ? isDark
                        ? "bg-rose-400"
                        : "bg-rose-500"
                      : isDark
                      ? "bg-emerald-400"
                      : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {alarmes.length === 0 && (
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  Nenhum alarme ativo nos CCMs.
                </div>
              )}

              {alarmes.map((alarm) => {
                const tone =
                  alarm.severity === "EMERGENCY"
                    ? isDark
                      ? "border-rose-500/40 bg-rose-900/40 text-rose-100"
                      : "border-rose-200 bg-rose-50 text-rose-900"
                    : alarm.severity === "HIGH"
                    ? isDark
                      ? "border-amber-500/40 bg-amber-900/40 text-amber-100"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                    : isDark
                    ? "border-sky-500/40 bg-sky-900/40 text-sky-100"
                    : "border-sky-200 bg-sky-50 text-sky-900";

                return (
                  <div
                    key={alarm.id}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${tone}`}
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-current" />
                    <div>
                      <p className="font-semibold leading-tight">{alarm.label}</p>
                      <p className="text-xs opacity-80">{alarm.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${panelClass} p-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Modo TV</p>
              <h3 className="text-lg font-semibold">Status geral em tela cheia</h3>
              {loading && <p className="text-xs text-slate-400">Atualizando dados...</p>}
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-slate-50">
                {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
              <p className="text-sm text-slate-400">
                {now.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
