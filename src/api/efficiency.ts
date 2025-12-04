// src/api/efficiency.ts

import { apiUrl } from "./api";

export type EfficiencyResponse = {
  ts: string;
  value: number;
  quality: "GOOD" | "BAD";
  error?: string;
};

/**
 * Retorna o snapshot da eficiência produtiva (baseado na carga de elevadores e redlers).
 */
export async function getProductiveEfficiency(): Promise<EfficiencyResponse> {
  const r = await fetch(apiUrl("/efficiency/productive"), { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Falha ao obter eficiência produtiva (HTTP ${r.status})`);
  }
  return r.json();
}

/**
 * Retorna o snapshot da "eficiência" energética (baseado na carga de todos os motores).
 */
export async function getEnergyEfficiency(): Promise<EfficiencyResponse> {
  const r = await fetch(apiUrl("/efficiency/energy"), { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Falha ao obter eficiência energética (HTTP ${r.status})`);
  }
  return r.json();
}

/**
 * Retorna uma lista com a carga individual de cada motor da categoria "elevador".
 */
export async function getElevatorsLoad() {
  const r = await fetch(apiUrl("/efficiency/elevators/load"), { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Falha ao obter carga dos elevadores (HTTP ${r.status})`);
  }
  return r.json();
}
