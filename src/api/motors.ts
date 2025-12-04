// src/api/motors.ts

export type MotorOverviewItem = {
  name: string;
  ccm: string;     // "ccm1" | "ccm2"
  status: number;  // 1 = ligado, 0 = desligado
  current: number;
  fault: number;   // 1 = falha/alarme, 0 = ok
  hours: number;
};

const RAW_BASE = import.meta.env.REACT_APP_API_BASE ?? "http://localhost:9090";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export async function getMotorsOverview(): Promise<MotorOverviewItem[]> {
  const r = await fetch(`${API_BASE}/api/motors/overview/stream`, {
    cache: "no-store",
  });
  if (!r.ok) {
    throw new Error(`Falha ao obter overview de motores (HTTP ${r.status})`);
  }

  const text = await r.text();

  // Se o endpoint já devolver JSON puro em forma de array, isto aqui funciona direto.
  // Se vier no formato "data:[{...}]" (SSE), removemos o "data:".
  const jsonStr = text.trim().startsWith("data:")
    ? text.trim().slice("data:".length).trim()
    : text.trim();

  try {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) {
      throw new Error("Resposta não é um array");
    }
    return arr as MotorOverviewItem[];
  } catch (e) {
    console.error("Erro ao parsear resposta de motors/overview:", e);
    throw new Error("Formato inválido em /api/motors/overview/stream");
  }
}
