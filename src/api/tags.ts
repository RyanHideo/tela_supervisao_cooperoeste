// src/api/tags.ts
// Funções para buscar tags do backend Modbus

import type { CcmKey } from "../config/ccm";

/** Tag “crua” vinda da API */
export type RawTag = {
  name: string;
  value: number | boolean;
  ts: string;
  quality: "GOOD" | "BAD" | "UNKNOWN" | string;
  error?: string | null;
};

/** Estrutura normalizada que o front usa */
export type NormalizedTags = {
  ts: string; // timestamp mais recente entre as tags
  values: Record<string, number | boolean | undefined>;
  meta: Record<string, RawTag>;
};

// Vite: variável definida no .env => VITE_API_BASE=http://localhost:9090
const RAW_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:9090";
// remove barra no final pra evitar "//api"
const API_BASE = RAW_BASE.replace(/\/+$/, "");

/** Normaliza um mapa { tagName: RawTag } em NormalizedTags */
function normalizeTagsMap(map: Record<string, RawTag>): NormalizedTags {
  const values: Record<string, number | boolean | undefined> = {};
  const meta: Record<string, RawTag> = {};
  let latestTs: string | undefined;

  for (const [key, tag] of Object.entries(map)) {
    meta[key] = tag;
    values[key] = tag.value;

    if (tag.ts) {
      if (!latestTs || Date.parse(tag.ts) > Date.parse(latestTs)) {
        latestTs = tag.ts;
      }
    }
  }

  return {
    ts: latestTs ?? new Date().toISOString(),
    values,
    meta,
  };
}

/**
 * Busca as tags de UM CCM (endpoint:
 *   /api/modbus/ccm1/tags  ou  /api/modbus/ccm2/tags
 */
export async function getTagsValues(ccmKey: CcmKey): Promise<NormalizedTags> {
  const resp = await fetch(`${API_BASE}/api/modbus/${ccmKey}/tags`, {
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(
      `Falha ao obter tags de ${ccmKey} (HTTP ${resp.status})`
    );
  }

  // Esperado: { "M1_status": { name, value, ts, ... }, ... }
  const data = (await resp.json()) as Record<string, RawTag>;

  return normalizeTagsMap(data);
}

/**
 * Busca TODAS as tags de todos os CCMs (endpoint:
 *   /api/modbus/tags/all
 * Retorno esperado:
 * {
 *   "ccm1": { "M1_status": { ... }, ... },
 *   "ccm2": { "M1_corrente": { ... }, ... }
 * }
 */
export async function getAllTagsValues(): Promise<
  Record<CcmKey, NormalizedTags>
> {
  const resp = await fetch(`${API_BASE}/api/modbus/tags/all`, {
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(
      `Falha ao obter tags de todos os CCMs (HTTP ${resp.status})`
    );
  }

  const raw = (await resp.json()) as Record<string, Record<string, RawTag>>;

  const result: Record<string, NormalizedTags> = {};
  for (const [ccmKey, tagsMap] of Object.entries(raw)) {
    result[ccmKey] = normalizeTagsMap(tagsMap);
  }

  return result as Record<CcmKey, NormalizedTags>;
}
