// src/api/tags.ts
import type { CcmKey } from "../config/ccm";

export type Quality = "GOOD" | "BAD";

export type RawTag = {
  name: string;
  value: number | boolean | null;
  ts: string;
  quality: Quality;
  error?: string;
};

export type TagsResponse = {
  ts: string;
  tags: Record<string, RawTag>;
};

export type NormalizedTags = {
  ts: string;
  values: Record<string, number | boolean | undefined>;
  meta: Record<string, RawTag>;
};

// Vite lê VITE_* em tempo de build
const RAW_BASE = import.meta.env.VITE_API_BASE ?? "";
// remove barra final pra evitar "//api"
const API_BASE = RAW_BASE.replace(/\/+$/, "");

/**
 * Busca as tags no back-end, para um CCM específico.
 *
 * ccm deve ser "ccm1" ou "ccm2" (mesma key do config do front).
 *
 * Endpoints:
 *  - http://localhost:9090/api/modbus/ccm1/tags
 *  - http://localhost:9090/api/modbus/ccm2/tags
 */
export async function getTagsValues(ccm: CcmKey): Promise<NormalizedTags> {
  const url = `${API_BASE}/api/modbus/${ccm}/tags`;

  const r = await fetch(url, { cache: "no-store" });

  if (!r.ok) {
    throw new Error(`Falha ao obter tags (HTTP ${r.status})`);
  }

  const data = (await r.json()) as TagsResponse;

  const values: Record<string, number | boolean | undefined> = {};
  const meta: Record<string, RawTag> = {};

  for (const [key, t] of Object.entries(data.tags)) {
    meta[key] = t;
    values[key] = t.value as any;
  }

  return {
    ts: data.ts,
    values,
    meta,
  };
}
