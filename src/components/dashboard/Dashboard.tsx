// src/components/dashboard/Dashboard.tsx
import { useMemo, type ReactNode } from "react";
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

  // getNumber mais robusto (aceita number, boolean e string)
  const getNumber = (key: string) => {
    // Cast para permitir verificação de string, caso a API retorne algo inesperado
    const raw = v[key] as number | boolean | string | undefined;

    if (typeof raw === "number") return raw;
    if (raw === true) return 1;
    if (raw === false) return 0;

    if (typeof raw === "string") {
      const parsed = Number(raw.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  };

  // tentamos pegar a chave do CCM (ex: "ccm1" / "ccm2")
  const ccmKey = ((config as any).key ?? "ccm1") as string;
  const isCcm2 = ccmKey.toLowerCase().includes("2");

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

  // helper pra interpretar coil/DI como booleano
  const isTrue = (raw: unknown): boolean =>
    raw === true || raw === 1 || raw === 1.0 || raw === "1";

  // ====== STATUS / ALARMES CCM ======
  const emergenciaAtiva = isTrue(v["STATUS_EMERGENCIA"]);
  const faltaFase = isTrue(v["STATUS_FALTA_FASE"]);
  const superAquecimento = isTrue(v["STATUS_SUPER_AQUECIMENTO"]);
  const modoAutomatico = isTrue(v["MODO_AUTOMATICO"]);

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

  // ✅ NOVO: formatador para 2 casas decimais sem mudar layout
  const formatNumeric = (value: unknown): ReactNode => {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    if (typeof value === "string") {
      const parsed = Number(value.replace(",", "."));
      if (!Number.isNaN(parsed)) {
        return parsed.toFixed(2);
      }
      // se não der pra converter, mostra a string original
      return value;
    }
    // mantém comportamento anterior de mostrar "--" se undefined/null
    return (value ?? "--") as ReactNode;
  };

  // ---- RESUMO DE MOTORES: usando isTrue para S/F (funciona com DI) ----
  const motorInfo = useMemo(() => {
    // agrupa por "Mxx" (M75_S, M75_F, etc.)
    const groups = new Map<string, { s?: boolean; f?: boolean }>();

    for (const key of Object.keys(v)) {
      const match = /^M(\d+)_([AFHS])$/.exec(key);
      if (!match) continue;

      const id = match[1]; // ex: "75"
      const suffix = match[2] as "A" | "F" | "H" | "S";
      const raw = v[key];

      const current = groups.get(id) ?? {};
      if (suffix === "S") current.s = isTrue(raw); // ligado?
      if (suffix === "F") current.f = isTrue(raw); // falha?
      groups.set(id, current);
    }

    const total = groups.size;
    let ativos = 0;
    let falha = 0;
    let desligados = 0;

    for (const motor of groups.values()) {
      const fault = motor.f === true;
      const on = motor.s === true;

      if (fault) falha++;
      else if (on) ativos++;
      else desligados++;
    }

    return { total, ativos, falha, desligados };
  }, [v]);

  const motoresTotal = motorInfo.total;
  const motoresAtivos = motorInfo.ativos;
  const motoresFalha = motorInfo.falha;
  const motoresDesligados = motorInfo.desligados;

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

  // ====== RESOLUÇÃO DAS TAGS NOVAS / ANTIGAS (FP, FP2, CONSUMO1, CONSUMO2, HZ, HZ2, etc.) ======

  // Fator de potência
  const fpValue = isCcm2
    ? getNumber("FP2") ??
      getNumber("CCM2_FATOR_POTENCIA") ??
      getNumber("FP")
    : getNumber("FP") ??
      getNumber("CCM1_FATOR_POTENCIA") ??
      getNumber("FP2");

  const fpQuality =
    (isCcm2
      ? m["FP2"]?.quality ?? m["CCM2_FATOR_POTENCIA"]?.quality
      : m["FP"]?.quality ?? m["CCM1_FATOR_POTENCIA"]?.quality) ??
    m["FP"]?.quality ??
    m["FP2"]?.quality;

  // Consumo total
  const consumoValue = isCcm2
    ? getNumber("CONSUMO2") ??
      getNumber("CCM2_CONSUMO_TOTAL") ??
      getNumber("CONSUMO_TOTAL")
    : getNumber("CONSUMO1") ??
      getNumber("CCM1_CONSUMO_TOTAL") ??
      getNumber("CONSUMO_TOTAL");

  const consumoQuality = isCcm2
    ? m["CONSUMO2"]?.quality ??
      m["CCM2_CONSUMO_TOTAL"]?.quality ??
      m["CONSUMO_TOTAL"]?.quality
    : m["CONSUMO1"]?.quality ??
      m["CCM1_CONSUMO_TOTAL"]?.quality ??
      m["CONSUMO_TOTAL"]?.quality;

  // Frequência
  const hzValue = isCcm2
    ? getNumber("HZ2") ?? getNumber("HZ")
    : getNumber("HZ") ?? getNumber("HZ2");

  const hzQuality = isCcm2
    ? m["HZ2"]?.quality ?? m["HZ"]?.quality
    : m["HZ"]?.quality ?? m["HZ2"]?.quality;

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
                  {formatNumeric(v["V1-V2"])}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2-L3</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["V2-V3"])}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3-L1</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["V3-V1"])}
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
                  {formatNumeric(v["V1-N"])}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2-N</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["V2-N"])}
                </span>
                <span className={unitLabelClass}>V</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3-N</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["V3-N"])}
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
                  {formatNumeric(v["L1"])}
                </span>
                <span className={unitLabelClass}>A</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L2</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["L2"])}
                </span>
                <span className={unitLabelClass}>A</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={smallLabelClass}>L3</span>
                <span className={valueTextClass}>
                  {formatNumeric(v["L3"])}
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
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber("KW")}
                unit="kW"
                decimals={1}
                quality={m["KW"]?.quality}
              />
            </div>
          </div>

          {/* Fator de Potência */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Fator de Potência</h3>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={fpValue}
                unit="cos φ"
                decimals={2}
                quality={fpQuality}
              />
            </div>
          </div>

          {/* Frequência */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Frequência</h3>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={hzValue}
                unit="Hz"
                decimals={1}
                quality={hzQuality}
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
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={consumoValue}
                unit="kWh"
                decimals={0}
                quality={consumoQuality}
              />
            </div>
          </div>

          {/* Temperatura painel */}
          <div className={cardBaseClass}>
            <div className="flex items-center justify-between">
              <h3 className={cardTitleClass}>Temperatura Painel (CCM)</h3>
            </div>

            <div className="mt-3">
              <TagValueCard
                label=""
                value={getNumber("TEMP_PAINEL")}
                unit="°C"
                decimals={1}
                quality={m["TEMP_PAINEL"]?.quality}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
