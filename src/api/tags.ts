// src/api/tags.ts
// Funções para buscar tags do backend Modbus

import type { CcmKey } from "../config/ccm";
import { apiUrl } from "./api";

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

/** Normaliza um mapa { tagName: RawTag } em NormalizedTags */
function normalizeTagsMap(
  map: Record<string, RawTag>,
  fallbackTs?: string
): NormalizedTags {
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

  let resolvedTs = latestTs;

  if (fallbackTs) {
    const fallbackMs = Date.parse(fallbackTs);
    if (!Number.isNaN(fallbackMs)) {
      if (!resolvedTs || fallbackMs > Date.parse(resolvedTs)) {
        resolvedTs = fallbackTs;
      }
    }
  }

  return {
    ts: resolvedTs ?? new Date().toISOString(),
    values,
    meta,
  };
}

/**
 * Busca as tags de UM CCM (endpoint:
 *   /api/tags?ccm=ccm1  ou  /api/tags?ccm=ccm2
 */
export async function getTagsValues(ccmKey: CcmKey): Promise<NormalizedTags> {
  const resp = await fetch(apiUrl(`/tags?ccm=${ccmKey}`), {
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(
      `Falha ao obter tags de ${ccmKey} (HTTP ${resp.status})`
    );
  }

  // Esperado: { ts, tags: { "M1_status": { name, value, ts, ... }, ... } }
  const data = (await resp.json()) as
    | { ts?: string; tags?: Record<string, RawTag> }
    | Record<string, RawTag>;

  const tagsMap =
    data && typeof data === "object" && "tags" in data && data.tags
      ? (data.tags as Record<string, RawTag>)
      : (data as Record<string, RawTag>);

  const ts =
    data &&
    typeof data === "object" &&
    "ts" in data &&
    typeof (data as any).ts === "string"
      ? (data as any).ts
      : undefined;

  return normalizeTagsMap(tagsMap ?? {}, ts);
}

/**
 * Busca TODAS as tags de todos os CCMs via /api/tags?ccm=
 */
export async function getAllTagsValues(): Promise<
  Record<CcmKey, NormalizedTags>
> {
  const resp = await fetch(apiUrl("/tags/unified"), {
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(`Falha ao obter tags unificadas (HTTP ${resp.status})`);
  }

  const data = (await resp.json()) as
    | { ts?: string; tags?: Record<string, RawTag> }
    | Record<string, RawTag>;

  const tagsMap =
    data && typeof data === "object" && "tags" in data && data.tags
      ? (data.tags as Record<string, RawTag>)
      : (data as Record<string, RawTag>);

  const ts =
    data &&
    typeof data === "object" &&
    "ts" in data &&
    typeof (data as any).ts === "string"
      ? (data as any).ts
      : undefined;

  const mapCcm1: Record<string, RawTag> = {};
  const mapCcm2: Record<string, RawTag> = {};

  if (tagsMap) {
    for (const [key, tag] of Object.entries(tagsMap)) {
      if (key.endsWith("__ccm1")) {
        const cleanKey = key.replace("__ccm1", "");
        mapCcm1[cleanKey] = { ...tag, name: cleanKey };
      } else if (key.endsWith("__ccm2")) {
        const cleanKey = key.replace("__ccm2", "");
        mapCcm2[cleanKey] = { ...tag, name: cleanKey };
      }
    }
  }

  return {
    ccm1: normalizeTagsMap(mapCcm1, ts),
    ccm2: normalizeTagsMap(mapCcm2, ts),
  };
}
