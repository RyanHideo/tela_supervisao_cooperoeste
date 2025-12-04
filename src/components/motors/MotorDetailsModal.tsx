// src/components/motors/MotorDetailsModal.tsx
import { useEffect, useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import type { MotorSummary } from "./MotorsPage";

type Props = {
  motor: MotorSummary;   // <-- não é mais | null
  onClose: () => void;
};

export function MotorDetailsModal({ motor, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // controla animação de entrada/saída
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // assim que monta, liga o fade/zoom
    setIsVisible(true);
  }, []);

  function handleClose() {
    // inicia animação de saída
    setIsVisible(false);
    // depois que a animação terminar, dispara o onClose do pai
    setTimeout(() => {
      onClose();
    }, 200); // mesmo tempo das classes `duration-200`
  }

  const pct = Math.max(0, Math.min(100, motor.cargaPercent ?? 0));
  const angle = pct * 3.6;

  const backdropClass =
    "fixed inset-0 z-40 flex items-center justify-center bg-black/60 " +
    "transition-opacity duration-200 " +
    (isVisible ? "opacity-100" : "opacity-0");

  const cardBase = isDark
    ? "relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl"
    : "relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl";

  const cardClass =
    cardBase +
    " transition-all duration-200 ease-out " +
    (isVisible
      ? "scale-100 translate-y-0"
      : "scale-95 -translate-y-2 opacity-0");

  const titleColor = isDark ? "text-slate-50" : "text-slate-900";
  const subtitleColor = isDark ? "text-slate-300" : "text-slate-600";
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";
  const infoTextColor = isDark ? "text-slate-100" : "text-slate-900";
  const innerGaugeBg = isDark ? "bg-slate-950" : "bg-white";

  // cor do texto de STATUS (sempre com uma classe text-*)
  const statusColorClass =
    motor.status === "Falha/Alarme"
      ? "text-rose-500"
      : motor.status === "Ligado"
      ? "text-emerald-500"
      : infoTextColor;

  return (
    <div className={backdropClass} onClick={handleClose}>
      {/* stopPropagation pra não fechar ao clicar dentro do card */}
      <div className={cardClass} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span
              className={`text-[11px] font-semibold tracking-[0.18em] ${labelColor}`}
            >
              MOTOR
            </span>
            <h3 className={`text-xl font-semibold ${titleColor}`}>
              {motor.id}
            </h3>
            <p className={`text-sm ${subtitleColor}`}>{motor.description}</p>
          </div>

          <button
            onClick={handleClose}
            className={
              "rounded-full px-3 py-1 text-xs font-medium transition-colors " +
              (isDark
                ? "border border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-slate-800/80"
                : "border border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-100")
            }
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          {/* Gauge de carga */}
          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40">
              {/* anel com a % de carga */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#22c55e ${angle}deg, ${
                    isDark ? "rgba(15,23,42,0.85)" : "rgba(226,232,240,0.85)"
                  } ${angle}deg)`,
                }}
              />
              {/* “furo” interno para virar anel */}
              <div className={`absolute inset-4 rounded-full ${innerGaugeBg}`} />
              {/* conteúdo central */}
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-1">
                <span
                  className={`text-[11px] uppercase tracking-[0.18em] ${labelColor}`}
                >
                  Carga
                </span>
                <span className="text-3xl font-semibold text-emerald-400">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Informações de status / horímetro / corrente / alarme */}
          <div className="flex flex-col justify-center gap-4 text-sm">
            <div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${labelColor}`}
              >
                Status
              </span>
              <p
                className={`mt-1 text-base font-semibold ${statusColorClass}`}
              >
                {motor.status}
              </p>
            </div>

            <div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${labelColor}`}
              >
                Horímetro
              </span>
              <p className={`mt-1 text-base font-semibold ${infoTextColor}`}>
                {motor.horimetroH} h
              </p>
            </div>

            {motor.currentA != null && (
              <div>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${labelColor}`}
                >
                  Corrente
                </span>
                <p className={`mt-1 text-base font-semibold ${infoTextColor}`}>
                  {motor.currentA.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  A
                </p>
              </div>
            )}

            <div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${labelColor}`}
              >
                Alarme
              </span>
              <p
                className={
                  "mt-1 text-base font-semibold " +
                  (motor.alarme === "OK" ? "text-emerald-500" : "text-rose-500")
                }
              >
                {motor.alarme}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé / explicação */}
        <div
          className={
            "mt-6 border-t pt-3 text-[11px] " +
            (isDark
              ? "border-slate-800 text-slate-500"
              : "border-slate-200 text-slate-500")
          }
        >
          <p>Percentual de carga e corrente em tempo real.</p>
          <p>
            Valores baseados nas leituras de corrente do CLP e nos limites
            definidos no backend.
          </p>
        </div>
      </div>
    </div>
  );
}
