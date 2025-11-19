// src/components/motors/MotorsPage.tsx
import { useState } from "react";
import { MotorDetailsModal } from "./MotorDetailsModal";
import type { CcmConfig } from "../../config/ccm";
import { useTheme } from "../../theme/ThemeContext";

type MotorStatus = "ON" | "OFF" | "ALARM";

type Motor = {
  id: string;
  name: string;
  status: MotorStatus;
  hours: number;
  alarmText: string;
  cargaPercent: number; // 0–100 (fake por enquanto)
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
};

type Props = {
  config: CcmConfig;
};

const FAKE_MOTORS: Motor[] = [
  {
    id: "Motor 101",
    name: "Esteira alimentação moinho",
    status: "OFF",
    hours: 116,
    alarmText: "OK",
    cargaPercent: 35,
  },
  {
    id: "Motor 102",
    name: "Esteira alimentação peneira",
    status: "OFF",
    hours: 88,
    alarmText: "OK",
    cargaPercent: 42,
  },
  {
    id: "Motor 103",
    name: "Esteira descarga de pó",
    status: "ALARM",
    hours: 170,
    alarmText: "Sobrecarga",
    cargaPercent: 92,
  },
  {
    id: "Motor 104",
    name: "Esteira granilha",
    status: "OFF",
    hours: 174,
    alarmText: "OK",
    cargaPercent: 18,
  },
  {
    id: "Motor 105",
    name: "Esteira areia de brita",
    status: "ON",
    hours: 173,
    alarmText: "OK",
    cargaPercent: 67,
  },
  {
    id: "Motor 106",
    name: "Esteira pó de rocha",
    status: "OFF",
    hours: 0,
    alarmText: "OK",
    cargaPercent: 5,
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

  const [selectedMotor, setSelectedMotor] = useState<MotorSummary | null>(
    null
  );

  const total = FAKE_MOTORS.length;
  const ativos = FAKE_MOTORS.filter((m) => m.status === "ON").length;
  const falha = FAKE_MOTORS.filter((m) => m.status === "ALARM").length;
  const desligados = FAKE_MOTORS.filter((m) => m.status === "OFF").length;

  const pageClass =
    "mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-10 pt-4";

  const cardBase = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3"
    : "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm";

  // helpers de cor dependentes do tema
  const headerSubtitleClass = isDark
    ? "text-xs text-slate-400"
    : "text-xs text-slate-600";

  const smallMutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

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

      {/* Filtros (layout) */}
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
            className={
              "rounded-lg border px-2 py-1 text-xs outline-none " +
              (isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-300 bg-white text-slate-800")
            }
          >
            <option>Todos</option>
            <option>Ligados</option>
            <option>Desligados</option>
            <option>Falha/Alarme</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1">
            <input type="checkbox" className="h-3 w-3" />
            <span className={filtroLabelClass}>Ordenar por nome (A–Z)</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="checkbox" className="h-3 w-3" />
            <span className={filtroLabelClass}>Ordenar por horímetro</span>
          </label>
          <span className={filtroLabelClass}>
            Exibindo {total} de {total}
          </span>
        </div>
      </section>

      {/* Cards dos motores */}
      <section className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FAKE_MOTORS.map((motor) => {
          // classes dependentes de tema dentro do card
          const idTextClass = isDark
            ? "text-xs text-slate-400"
            : "text-xs text-slate-500";

          const nameTextClass = isDark
            ? "text-sm font-semibold text-slate-100"
            : "text-sm font-semibold text-slate-900";

          const labelLineClass = isDark
            ? "text-xs text-slate-400"
            : "text-xs text-slate-500";

          // texto principal (Status / Horímetro) -> claro no dark, preto no light
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
                  name: motor.id,
                  description: motor.name,
                  status: statusText(motor.status),
                  horimetroH: motor.hours,
                  cargaPercent: motor.cargaPercent,
                  alarme: motor.alarmText,
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
                <span className={valueBaseClass}>{motor.hours} h</span>
              </div>

              <div className={labelLineClass}>
                Alarme: <span className={alarmValueClass}>{motor.alarmText}</span>
              </div>

              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // não abrir modal ao clicar no botão
                    // depois você pluga o backend aqui para zerar horímetro
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
      <MotorDetailsModal
        motor={selectedMotor}
        onClose={() => setSelectedMotor(null)}
      />
    </div>
  );
}
