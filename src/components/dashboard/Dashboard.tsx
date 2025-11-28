// src/components/dashboard/Dashboard.tsx
import { useMemo } from "react";
import { useTheme } from "../../theme/ThemeContext";
import type { CcmConfig } from "../../config/ccm";
import { useTags } from "../../hooks/useTags";
import { TagValueCard } from "./TagValueCard";
import { MotorDonutCard } from "./MotorDonutCard";

type Props = {
  config: CcmConfig;
};

type AlarmSeverity = "EMERGENCY" | "HIGH" | "MEDIUM";

type AlarmItem = {
  id: string;
  label: string;
  detail?: string;
  severity: AlarmSeverity;
};

export function Dashboard({ config }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { ts, values, meta, error } = useTags(config);

  const v = values ?? {};
  const m = meta ?? {};
  const prefix = config.key.toUpperCase(); // "CCM1" ou "CCM2"

  const getNumber = (key: string) => {
    const raw = v[key];
    return typeof raw === "number" ? raw : undefined;
  };

  const pageClass = isDark
    ? "min-h-screen bg-slate-950 text-slate-100"
    : "min-h-screen bg-slate-100 text-slate-900";

  const cardBaseClass = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3"
    : "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm";

  const cardTitleClass = isDark
    ? "text-lg font-bold text-slate-50 tracking-wide"
    : "text-lg font-bold text-slate-900 tracking-wide";

  const hasData = Boolean(ts);

  const connectionStatus = useMemo(() => {
    if (error) {
      return {
        label: "Desconectado do CLP",
        color: isDark ? "text-rose-300" : "text-rose-600",
        dot: isDark ? "bg-rose-400" : "bg-rose-500",
        helper: "Erro ao comunicar com o backend.",
      };
    }

    if (!hasData) {
      return {
        label: "Aguardando leitura do CLP",
        color: isDark ? "text-amber-300" : "text-amber-600",
        dot: isDark ? "bg-amber-400" : "bg-amber-500",
        helper: "Ainda não recebemos a primeira atualização de tags.",
      };
    }

    return {
      label: "Conectado ao CLP",
      color: isDark ? "text-emerald-300" : "text-emerald-600",
      dot: isDark ? "bg-emerald-400" : "bg-emerald-500",
      helper: ts
        ? `Última atualização: ${new Date(ts).toLocaleTimeString()}`
        : "Última atualização indisponível",
    };
  }, [error, hasData, ts, isDark]);

  // helper pra interpretar coil como booleano
  const isTrue = (raw: unknown): boolean =>
    raw === true || raw === 1 || raw === 1.0 || raw === "1";

  // ====== STATUS / ALARMES (coils com prefixo CCM1_ / CCM2_) ======
  const emergenciaAtiva = isTrue(v[`${prefix}_STATUS_EMERGENCIA`]);
  const faltaFase = isTrue(v[`${prefix}_STATUS_FALTA_FASE`]);
  const superAquecimento = isTrue(v[`${prefix}_STATUS_SUPER_AQUECIMENTO`]);
  const modoAutomatico = isTrue(v[`${prefix}_MODO_AUTOMATICO`]);

  const alarms: AlarmItem[] = [];

  if (emergenciaAtiva) {
    alarms.push({
      id: "emergencia",
      label: "Emergência ativa",
      detail: "Comando de emergência acionado no CCM.",
      severity: "EMERGENCY",
    });
  }

  if (faltaFase) {
    alarms.push({
      id: "falta_fase",
      label: "Falta de fase",
      detail: "Verificar alimentação das fases do CCM.",
      severity: "HIGH",
    });
  }

  if (superAquecimento) {
    alarms.push({
      id: "super_aquecimento",
      label: "Superaquecimento do CCM",
      detail: "Temperatura elevada detectada no painel.",
      severity: "MEDIUM",
    });
  }

  const severityWeight: Record<AlarmSeverity, number> = {
    EMERGENCY: 3,
    HIGH: 2,
    MEDIUM: 1,
  };

  alarms.sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity]
  );

  const hasAlarms = alarms.length > 0;

  const alarmDotClass = hasAlarms
    ? isDark
      ? "bg-rose-400"
      : "bg-rose-500"
    : isDark
    ? "bg-emerald-400"
    : "bg-emerald-500";

  const alarmHeaderTextClass = hasAlarms
    ? isDark
      ? "text-rose-300"
      : "text-rose-600"
    : isDark
    ? "text-emerald-300"
    : "text-emerald-600";

  const alarmSummaryLabel = hasAlarms
    ? `${alarms.length} alarme${
        alarms.length > 1 ? "s" : ""
      } ativo${alarms.length > 1 ? "s" : ""}`
    : "Nenhum ativo";

  const alarmCardClass = cardBaseClass;

  // subtítulos (L1-L2, etc.)
  const smallLabelClass = isDark
    ? "text-xs font-semibold text-slate-300"
    : "text-xs font-semibold text-slate-600";

  const unitLabelClass = isDark
    ? "text-xs font-semibold text-emerald-400"
    : "text-xs font-semibold text-emerald-600";

  const valueTextClass = isDark
    ? "text-lg font-semibold text-slate-50"
    : "text-lg font-semibold text-slate-900";

  // ---- RESUMO DE MOTORES (tags que você vai criar no CLP) ----
  const motoresTotal = Number(v[`${prefix}_MOTORES_TOTAL`] ?? 0);
  const motoresAtivos = Number(v[`${prefix}_MOTORES_ATIVOS`] ?? 0);
  const motoresFalha = Number(v[`${prefix}_MOTORES_FALHA`] ?? 0);
  const motoresDesligados = Number(
    v[`${prefix}_MOTORES_DESLIGADOS`] ??
      motoresTotal - motoresAtivos - motoresFalha
  );

  // Chip de modo auto/manual
  const modeChipClass =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium " +
    (modoAutomatico
      ? isDark
        ? "border-emerald-500/50 bg-emerald-900/50 text-emerald-200"
        : "border-emerald-300 bg-emerald-50 text-emerald-700"
      : isDark
      ? "border-slate-600 bg-slate-900/60 text-slate-200"
      : "border-slate-300 bg-slate-50 text-slate-700");

  return (
    <div className={pageClass}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 pb-10 pt-4 sm:px-4">
        {/* Barra de status do CLP + modo de operação */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className={`h-2 w-2 rounded-full ${connectionStatus.dot}`} />
            <span className={connectionStatus.color}>
              {connectionStatus.label}
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              • {connectionStatus.helper}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Modo de operação:</span>
            <span className={modeChipClass}>
              {modoAutomatico ? "Automático" : "Manual"}
            </span>
          </div>
        </div>

        {/* ALARMES + GRÁFICO DE MOTORES */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)]">
          {/* Coluna Alarmes */}
          <div className="flex flex-col gap-2">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={cardTitleClass}>Alarmes</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`h-2 w-2 rounded-full ${alarmDotClass}`} />
                <span className={alarmHeaderTextClass}>
                  {alarmSummaryLabel}
                </span>
              </div>
            </header>

            <div className={`${alarmCardClass} relative`}>
              {hasAlarms ? (
                <>
                  <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-1">
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
                            return isDark
                              ? "border-sky-500/40 bg-sky-950/40 text-sky-100"
                              : "border-sky-200 bg-sky-50 text-sky-900";
                          default:
                            return "";
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
          </div>

          {/* Coluna Gráfico de Motores */}
          <MotorDonutCard
            total={motoresTotal}
            ativos={motoresAtivos}
            falha={motoresFalha}
            desligados={motoresDesligados}
          />
        </section>

        {/* TENSÕES LL / LN / CORRENTE */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Tensão LL */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Tensão LL</h3>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L1-L2</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LL_L1L2`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2-L3</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LL_L2L3`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3-L1</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LL_L3L1`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
            </div>
          </div>

          {/* Tensão LN */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Tensão LN</h3>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L1-N</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LN_L1N`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2-N</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LN_L2N`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3-N</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_TENSAO_LN_L3N`] ?? "--"}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
            </div>
          </div>

          {/* Corrente */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Corrente</h3>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L1</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_CORRENTE_L1`] ?? "--"}
                </span>
                <span className={unitLabelClass}>A</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_CORRENTE_L2`] ?? "--"}
                </span>
                <span className={unitLabelClass}>A</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3</span>
                <span className={valueTextClass}>
                  {v[`${prefix}_CORRENTE_L3`] ?? "--"}
                </span>
                <span className={unitLabelClass}>A</span>
              </div>
            </div>
          </div>
        </section>

        {/* LINHA DE MÉTRICAS FINAIS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Potência */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Potência</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {m[`${prefix}_POTENCIA`]?.quality ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber(`${prefix}_POTENCIA`)}
                unit="kVA"
                decimals={1}
                quality={m[`${prefix}_POTENCIA`]?.quality}
              />
            </div>
          </div>

          {/* Fator de Potência */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Fator de Potência</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {m[`${prefix}_FATOR_POTENCIA`]?.quality ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber(`${prefix}_FATOR_POTENCIA`)}
                unit="cos φ"
                decimals={2}
                quality={m[`${prefix}_FATOR_POTENCIA`]?.quality}
              />
            </div>
          </div>

          {/* Frequência */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Frequência</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {m[`${prefix}_FREQUENCIA`]?.quality ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber(`${prefix}_FREQUENCIA`)}
                unit="Hz"
                decimals={1}
                quality={m[`${prefix}_FREQUENCIA`]?.quality}
              />
            </div>
          </div>
        </section>

        {/* CONSUMO / TEMPERATURA */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Consumo total */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Consumo Total</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {m[`${prefix}_CONSUMO_TOTAL`]?.quality ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber(`${prefix}_CONSUMO_TOTAL`)}
                unit="kWh"
                decimals={0}
                quality={m[`${prefix}_CONSUMO_TOTAL`]?.quality}
              />
            </div>
          </div>

          {/* Temperatura painel */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Temperatura Painel (CCM)</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {m[`${prefix}_TEMP_PAINEL`]?.quality ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber(`${prefix}_TEMP_PAINEL`)}
                unit="°C"
                decimals={1}
                quality={m[`${prefix}_TEMP_PAINEL`]?.quality}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
