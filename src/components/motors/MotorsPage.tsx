// src/components/motors/MotorsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { MotorDetailsModal } from "./MotorDetailsModal";
import type { CcmConfig } from "../../config/ccm";
import { useTheme } from "../../theme/ThemeContext";
import { useTags } from "../../hooks/useTags";

type MotorStatus = "ON" | "OFF" | "ALARM";

type Motor = {
  id: string; // ex: "M1" ou pode ser o próprio nome
  name: string;
  status: MotorStatus;
  hours: number;
  alarmText: string;
  cargaPercent: number; // 0–100
  currentA: number | null; // corrente instantânea do motor
  description?: string;
};

// resumo que o modal recebe
export type MotorSummary = {
  id: string;
  name: string;
  description: string;
  status: string;
  horimetroH: number;
  cargaPercent: number;
  alarme: string;
  currentA: number | null;
};

type Props = {
  config: CcmConfig;
};

// shape do endpoint /api/motors/overview(/stream)
type ApiMotorOverview = {
  name: string;
  ccm: string;
  status: number; // 0/1
  current: number; // A
  fault: number; // 0 = ok, !=0 falha
  hours: number;
};

/**
 * BASE DA API
 * Usa env do Vite se existir (VITE_API_BASE ou VITE_REACT_APP_API_BASE),
 * senão cai em http://localhost:9090.
 */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (import.meta as any).env?.VITE_REACT_APP_API_BASE ??
  "http://localhost:9090";

// remove barra no final pra evitar "//backend"
const API_BASE = RAW_BASE.replace(/\/+$/, "");

// Fallback para quando não houver nada
const FAKE_MOTORS: Motor[] = [
  {
    id: "Motor 101",
    name: "Esteira alimentação moinho",
    status: "OFF",
    hours: 116,
    alarmText: "OK",
    cargaPercent: 35,
    currentA: null,
  },
  {
    id: "Motor 102",
    name: "Esteira alimentação peneira",
    status: "OFF",
    hours: 88,
    alarmText: "OK",
    cargaPercent: 42,
    currentA: null,
  },
  {
    id: "Motor 103",
    name: "Esteira descarga de pó",
    status: "ALARM",
    hours: 170,
    alarmText: "Sobrecarga",
    cargaPercent: 92,
    currentA: null,
  },
  {
    id: "Motor 104",
    name: "Esteira granilha",
    status: "OFF",
    hours: 174,
    alarmText: "OK",
    cargaPercent: 18,
    currentA: null,
  },
  {
    id: "Motor 105",
    name: "Esteira areia de brita",
    status: "ON",
    hours: 173,
    alarmText: "OK",
    cargaPercent: 67,
    currentA: null,
  },
  {
    id: "Motor 106",
    name: "Esteira pó de rocha",
    status: "OFF",
    hours: 0,
    alarmText: "OK",
    cargaPercent: 5,
    currentA: null,
  },
];

function statusDot(status: MotorStatus, isDark: boolean) {
  if (status === "ON") return isDark ? "bg-emerald-400" : "bg-emerald-500";
  if (status === "ALARM") return isDark ? "bg-rose-400" : "bg-rose-500";
  return isDark ? "bg-slate-500" : "bg-slate-400";
}

function statusText(status: MotorStatus) {
  if (status === "ON") return "Ligado";
  if (status === "ALARM") return "Falha/Alarme";
  return "Desligado";
}

export function MotorsPage({ config }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedMotor, setSelectedMotor] = useState<MotorSummary | null>(null);

  // estado de filtro/ordenação
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ON" | "OFF" | "ALARM"
  >("ALL");
  const [sortByName, setSortByName] = useState(false);
  const [sortByHours, setSortByHours] = useState(false);

  // overview vindo do backend (via SSE)
  const [overview, setOverview] = useState<ApiMotorOverview[] | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // tags continuam existindo como fallback (Mxx_A/F/H/S)
  const { values } = useTags(config);
  const v = values ?? {};

  // ================== STREAM /api/motors/overview/stream (SSE) ==================
  useEffect(() => {
    let cancelled = false;
    // EventSource é reconectado automaticamente pelo browser em caso de queda
    const es = new EventSource(`${API_BASE}/api/motors/overview/stream`);

    es.onmessage = (evt) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(evt.data) as ApiMotorOverview[];
        setOverview(Array.isArray(data) ? data : []);
        setOverviewError(null);
      } catch (err) {
        console.error("Erro ao parsear SSE de /motors/overview/stream:", err);
        setOverviewError("Falha ao interpretar dados de motores (stream).");
      }
    };

    es.onerror = (evt) => {
      console.error("Erro no EventSource de /motors/overview/stream:", evt);
      if (!cancelled) {
        setOverviewError("Erro na conexão de streaming dos motores.");
      }
      // não fechamos aqui; deixamos o browser tentar reconectar
      // se quiser forçar, pode usar es.close()
    };

    return () => {
      cancelled = true;
      es.close();
    };
  }, []);

  // ================== FALLBACK PELO MAPEAMENTO Mxx_* ==================
  const motorsFromTags: Motor[] = useMemo(() => {
    type Aggregated = {
      id: string; // "M1"
      a?: number;
      f?: number;
      h?: number;
      s?: number;
    };

    const groups = new Map<string, Aggregated>();

    for (const [key, rawVal] of Object.entries(v)) {
      const match = /^M(\d+)_([AFHS])$/.exec(key);
      if (!match) continue;

      const num = match[1]; // "1"
      const suffix = match[2] as "A" | "F" | "H" | "S";
      const id = `M${num}`;

      const current = groups.get(id) ?? { id };
      const nVal = typeof rawVal === "number" ? rawVal : undefined;

      if (suffix === "A" && nVal !== undefined) current.a = nVal;
      if (suffix === "F" && nVal !== undefined) current.f = nVal;
      if (suffix === "H" && nVal !== undefined) current.h = nVal;
      if (suffix === "S" && nVal !== undefined) current.s = nVal;

      groups.set(id, current);
    }

    if (groups.size === 0) {
      return [];
    }

    // determina maior corrente para normalizar a % de carga
    let maxA = 0;
    for (const g of groups.values()) {
      if (typeof g.a === "number" && g.a > maxA) {
        maxA = g.a;
      }
    }

    const result: Motor[] = [];

    for (const g of groups.values()) {
      const on = !!g.s && g.s !== 0;
      const fault = !!g.f && g.f !== 0;

      let status: MotorStatus = "OFF";
      if (fault) status = "ALARM";
      else if (on) status = "ON";

      const hours = typeof g.h === "number" ? g.h : 0;

      let cargaPercent = 0;
      if (maxA > 0 && typeof g.a === "number") {
        cargaPercent = Math.round(
          Math.min(100, Math.max(0, (g.a / maxA) * 100))
        );
      }

      result.push({
        id: g.id,
        name: g.id,
        status,
        hours,
        alarmText: fault ? "Falha" : "OK",
        cargaPercent,
        currentA: typeof g.a === "number" ? g.a : null,
        description: g.id,
      });
    }

    // ordena por número do motor (default)
    result.sort((a, b) =>
      a.id.localeCompare(b.id, "pt-BR", { numeric: true })
    );

    return result;
  }, [v]);

  // ================== NORMALIZAÇÃO DO OVERVIEW P/ Motor[] ==================
  const motors: Motor[] = useMemo(() => {
    // tenta usar o overview via stream primeiro
    if (overview && overview.length > 0) {
      const rawCcmId =
        (config as any).id ?? (config as any).ccm ?? (config as any).key ?? "";

      const ccmId =
        typeof rawCcmId === "string" && rawCcmId.length > 0
          ? rawCcmId
          : undefined;

      // filtra só motores do CCM atual (se tiver id definido)
      const listForThisCcm = overview.filter((m) =>
        ccmId ? m.ccm === ccmId : true
      );

      if (listForThisCcm.length > 0) {
        // maior corrente para normalizar % de carga
        let maxCurrent = 0;
        for (const m of listForThisCcm) {
          if (typeof m.current === "number" && m.current > maxCurrent) {
            maxCurrent = m.current;
          }
        }

        return listForThisCcm.map((m, index) => {
          const fault = typeof m.fault === "number" && m.fault !== 0;

          let status: MotorStatus = "OFF";
          if (fault) status = "ALARM";
          else if (m.status === 1) status = "ON";

          let cargaPercent = 0;
          if (maxCurrent > 0 && typeof m.current === "number") {
            cargaPercent = Math.round(
              Math.min(100, Math.max(0, (m.current / maxCurrent) * 100))
            );
          }

          return {
            id: `M${index + 1}`,
            name: m.name,
            status,
            hours: typeof m.hours === "number" ? m.hours : 0,
            alarmText: fault ? "Falha" : "OK",
            cargaPercent,
            currentA: typeof m.current === "number" ? m.current : null,
            description: m.name,
          };
        });
      }
    }

    // se não tiver overview (ou não tiver motor para esse CCM),
    // cai para as tags, e se ainda assim não tiver nada, usa fake
    if (motorsFromTags.length > 0) return motorsFromTags;
    return FAKE_MOTORS;
  }, [overview, motorsFromTags, config]);

  const total = motors.length;
  const ativos = motors.filter((m) => m.status === "ON").length;
  const falha = motors.filter((m) => m.status === "ALARM").length;
  const desligados = motors.filter((m) => m.status === "OFF").length;

  // aplica filtro + ordenação para exibir na tela
  const filteredMotors = useMemo(() => {
    let list = [...motors];

    // filtro por status
    if (statusFilter !== "ALL") {
      list = list.filter((m) => m.status === statusFilter);
    }

    // ordenação
    if (sortByName) {
      list.sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR", {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (sortByHours) {
      list.sort((a, b) => b.hours - a.hours); // maior horímetro primeiro
    } else {
      // default: por id
      list.sort((a, b) =>
        a.id.localeCompare(b.id, "pt-BR", { numeric: true })
      );
    }

    return list;
  }, [motors, statusFilter, sortByName, sortByHours]);

  const pageClass =
    "mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-10 pt-4";

  const cardBase = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3"
    : "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm";

  // helpers de cor dependentes do tema
  const headerSubtitleClass = isDark
    ? "text-xs text-slate-400"
    : "text-xs text-slate-600";

  const smallMutedText = isDark ? "text-slate-400" : "text-slate-500";

  const resumoLabelClass = smallMutedText + " text-xs font-medium";

  const filtroLabelClass = smallMutedText + " text-xs";

  return (
    <div className={pageClass}>
      {/* Cabeçalho */}
      <header className="flex flex-col gap-1">
        <h2
          className={
            "text-lg font-bold tracking-wide " +
            (isDark ? "text-slate-50" : "text-slate-900")
          }
        >
          Motores • {config.displayName}
        </h2>
        <p className={headerSubtitleClass}>
          Status geral dos motores do CCM.
        </p>
        {overviewError && (
          <p className="text-xs text-rose-400">
            Erro ao carregar overview dos motores: {overviewError}
          </p>
        )}
      </header>

      {/* Resumo (ligados / desligados / falha) */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className={cardBase}>
          <span className={resumoLabelClass}>Ligados</span>
          <span
            className={
              "text-3xl font-semibold " +
              (isDark ? "text-slate-50" : "text-slate-900")
            }
          >
            {ativos}
          </span>
        </div>
        <div className={cardBase}>
          <span className={resumoLabelClass}>Desligados</span>
          <span
            className={
              "text-3xl font-semibold " +
              (isDark ? "text-slate-50" : "text-slate-900")
            }
          >
            {desligados}
          </span>
        </div>
        <div className={cardBase}>
          <span className={resumoLabelClass}>Falha / Alarme</span>
          <span className="text-3xl font-semibold text-rose-400">
            {falha}
          </span>
        </div>
      </section>

      {/* Filtros */}
      <section
        className={
          (isDark
            ? "rounded-2xl border border-slate-800 bg-slate-900/70"
            : "rounded-2xl border border-slate-200 bg-white shadow-sm") +
          " mt-2 flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs"
        }
      >
        <div className="flex items-center gap-2">
          <span className={filtroLabelClass}>Mostrar:</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "ALL" | "ON" | "OFF" | "ALARM"
              )
            }
            className={
              "rounded-lg border px-2 py-1 text-xs outline-none " +
              (isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-300 bg-white text-slate-800")
            }
          >
            <option value="ALL">Todos</option>
            <option value="ON">Ligados</option>
            <option value="OFF">Desligados</option>
            <option value="ALARM">Falha/Alarme</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              className="h-3 w-3"
              checked={sortByName}
              onChange={(e) => {
                const checked = e.target.checked;
                setSortByName(checked);
                if (checked) setSortByHours(false); // só um critério por vez
              }}
            />
            <span className={filtroLabelClass}>Ordenar por nome (A–Z)</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              className="h-3 w-3"
              checked={sortByHours}
              onChange={(e) => {
                const checked = e.target.checked;
                setSortByHours(checked);
                if (checked) setSortByName(false);
              }}
            />
            <span className={filtroLabelClass}>Ordenar por horímetro</span>
          </label>
          <span className={filtroLabelClass}>
            Exibindo {filteredMotors.length} de {total}
          </span>
        </div>
      </section>

      {/* Cards dos motores */}
      <section className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMotors.map((motor) => {
          const idTextClass = isDark
            ? "text-xs text-slate-400"
            : "text-xs text-slate-500";

          const nameTextClass = isDark
            ? "text-sm font-semibold text-slate-100"
            : "text-sm font-semibold text-slate-900";

          const labelLineClass = isDark
            ? "text-xs text-slate-400"
            : "text-xs text-slate-500";

          const valueBaseClass = isDark
            ? "font-medium text-slate-100"
            : "font-medium text-slate-900";

          const statusValueClass =
            motor.status === "ALARM"
              ? "font-medium text-rose-400"
              : motor.status === "ON"
              ? "font-medium text-emerald-500"
              : valueBaseClass;

          const alarmValueClass =
            motor.status === "ALARM"
              ? "font-medium text-rose-400"
              : "font-medium text-emerald-400";

          return (
            <article
              key={motor.id}
              role="button"
              onClick={() =>
                setSelectedMotor({
                  id: motor.id,
                  name: motor.name,
                  description: motor.description ?? motor.name,
                  status: statusText(motor.status),
                  horimetroH: motor.hours,
                  cargaPercent: motor.cargaPercent,
                  alarme: motor.alarmText,
                  currentA: motor.currentA,
                })
              }
              className={
                cardBase +
                " cursor-pointer hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/15 transition"
              }
            >
              {/* Título + status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "h-2 w-2 rounded-full " +
                      statusDot(motor.status, isDark)
                    }
                  />
                  <span className={idTextClass}>{motor.id}</span>
                </div>
              </div>

              <div className={nameTextClass}>{motor.name}</div>

              <div className={labelLineClass}>
                Status:{" "}
                <span className={statusValueClass}>
                  {statusText(motor.status)}
                </span>
              </div>

              <div className={labelLineClass}>
                Horímetro:{" "}
                <span className={valueBaseClass}>
                  {motor.hours.toFixed(1)} h
                </span>
              </div>

              <div className={labelLineClass}>
                Alarme:{" "}
                <span className={alarmValueClass}>{motor.alarmText}</span>
              </div>

              <div className={labelLineClass}>
                Carga estimada:{" "}
                <span className={valueBaseClass}>{motor.cargaPercent}%</span>
              </div>

              {motor.currentA != null && (
                <div className={labelLineClass}>
                  Corrente:{" "}
                  <span className={valueBaseClass}>
                    {motor.currentA.toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    A
                  </span>
                </div>
              )}

              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // não abrir modal ao clicar no botão
                    // aqui depois você pluga o backend pra zerar horímetro
                  }}
                  className={
                    "w-fit rounded-full px-3 py-1 text-xs font-medium shadow-sm " +
                    (isDark
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200")
                  }
                >
                  Zerar horímetro
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Modal de detalhes com gauge de carga */}
      {selectedMotor && (
        <MotorDetailsModal
          motor={selectedMotor}
          onClose={() => setSelectedMotor(null)}
        />
      )}
    </div>
  );
}

