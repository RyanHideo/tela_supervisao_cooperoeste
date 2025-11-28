// src/api/efficiency.ts

// Mesma estrutura para produtiva e energética.
// Exemplo do back:
// {
//   "overallEfficiency": 0.85,
//   "totalActiveCurrent": 42.5,
//   "totalNominalCurrentOfActives": 50.0,
//   "activeProductiveMotorsCount": 2,
//   "activeMotorNames": [
//     "Elevador de Grãos 1",
//     "Redler de Expedição"
//   ]
// }
export type EfficiencyResponse = {
  overallEfficiency: number; // 0–1 (0.85 = 85%)
  totalActiveCurrent: number;
  totalNominalCurrentOfActives: number;
  activeProductiveMotorsCount: number;
  activeMotorNames: string[];
};

// Vite lê VITE_* em tempo de build
const RAW_BASE = import.meta.env.VITE_API_BASE ?? "";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

// paths fixos dos endpoints:
//  - /api/efficiency/productive
//  - /api/efficiency/energy
async function fetchEfficiency(path: string): Promise<EfficiencyResponse> {
  const url = `${API_BASE}${path}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Falha ao obter eficiência (${path}) (HTTP ${r.status})`);
  }

  const data = (await r.json()) as EfficiencyResponse;
  return data;
}

export function getProductiveEfficiency(): Promise<EfficiencyResponse> {
  return fetchEfficiency("/api/efficiency/productive");
}

export function getEnergyEfficiency(): Promise<EfficiencyResponse> {
  return fetchEfficiency("/api/efficiency/energy");
}
