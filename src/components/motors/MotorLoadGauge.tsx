// src/components/motors/MotorLoadGauge.tsx
import React from "react";

type Props = {
  percent: number; // 0-100
};

export function MotorLoadGauge({ percent }: Props) {
  const safe = Math.max(0, Math.min(100, percent));
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (safe / 100) * circumference;

  // cores
  const trackColor = "#1f2937"; // slate-800
  const valueColor =
    safe < 80 ? "#22c55e" : safe < 95 ? "#eab308" : "#f97373"; // verde / amarelo / vermelho

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-40 w-40">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg]"
        >
          {/* trilho */}
          <circle
            stroke={trackColor}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* valor */}
          <circle
            stroke={valueColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* valor no centro */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Carga
          </span>
          <span className="text-3xl font-bold text-slate-50">
            {safe.toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Percentual de carga em tempo real.
      </p>
    </div>
  );
}
