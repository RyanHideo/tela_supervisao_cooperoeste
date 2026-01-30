// src/hooks/useMultiCcmTags.ts
import { useEffect, useState } from "react";
import { getAllTagsValues, type NormalizedTags } from "../api/tags";
import type { CcmKey } from "../config/ccm";

type UseMultiCcmTagsOptions = {
  intervalMs?: number;
};

type UseMultiCcmTagsResult = {
  ts?: string;
  values: NormalizedTags["values"];
  meta: NormalizedTags["meta"];
  valuesMerged: NormalizedTags["values"];
  metaMerged: NormalizedTags["meta"];
  valuesByCcm: Record<CcmKey, NormalizedTags["values"]> | null;
  metaByCcm: Record<CcmKey, NormalizedTags["meta"]> | null;
  loading: boolean;
  error: string | null;
  warning: string | null;
};

function applyLegacyAliases(
  values: Record<string, number | boolean | undefined>
) {
  const aliasedValues: Record<string, number | boolean | undefined> = {
    ...values,
  };

  // FATOR DE POTENCIA
  if (
    aliasedValues["CCM1_FATOR_POTENCIA"] === undefined &&
    values["FP"] !== undefined
  ) {
    aliasedValues["CCM1_FATOR_POTENCIA"] = values["FP"];
  }

  if (
    aliasedValues["CCM2_FATOR_POTENCIA"] === undefined &&
    values["FP2"] !== undefined
  ) {
    aliasedValues["CCM2_FATOR_POTENCIA"] = values["FP2"];
  }

  // POTENCIA APARENTE (kVA)
  if (
    aliasedValues["CCM1_POTENCIA"] === undefined &&
    (values["PA"] !== undefined || values["PA1"] !== undefined)
  ) {
    aliasedValues["CCM1_POTENCIA"] =
      (values["PA"] as any) ?? (values["PA1"] as any);
  }

  if (
    aliasedValues["CCM2_POTENCIA"] === undefined &&
    values["PA2"] !== undefined
  ) {
    aliasedValues["CCM2_POTENCIA"] = values["PA2"];
  }

  // CONSUMO TOTAL (kWh)
  if (
    aliasedValues["CCM1_CONSUMO_TOTAL"] === undefined &&
    (values["CONSUMO1"] !== undefined || values["CONSUMO_TOTAL"] !== undefined)
  ) {
    aliasedValues["CCM1_CONSUMO_TOTAL"] =
      (values["CONSUMO1"] as any) ?? (values["CONSUMO_TOTAL"] as any);
  }

  if (
    aliasedValues["CCM2_CONSUMO_TOTAL"] === undefined &&
    values["CONSUMO2"] !== undefined
  ) {
    aliasedValues["CCM2_CONSUMO_TOTAL"] = values["CONSUMO2"];
  }

  return aliasedValues;
}

export function useMultiCcmTags(
  options: UseMultiCcmTagsOptions = {}
): UseMultiCcmTagsResult {
  const { intervalMs = 1500 } = options;

  const [data, setData] = useState<Record<CcmKey, NormalizedTags> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchOnce() {
      try {
        const res = await getAllTagsValues();
        if (!mounted) return;
        setData(res);
        setError(null);
        setWarning(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Erro ao buscar tags");
        setWarning(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOnce();
    timer = window.setInterval(fetchOnce, intervalMs);

    return () => {
      mounted = false;
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
    };
  }, [intervalMs]);

  // ---------- MERGE DOS CCMs ----------
  const mergedValues: Record<string, number | boolean | undefined> = {};
  const mergedMeta: NormalizedTags["meta"] = {};

  if (data) {
    Object.values(data).forEach((res) => {
      Object.assign(mergedValues, res.values);
      Object.assign(mergedMeta, res.meta);
    });
  }

  // ---------- ALIASES PARA AS NOVAS TAGS DO BACK (APENAS MERGED) ----------
  const aliasedValues = applyLegacyAliases(mergedValues);

  // ---------- TS MAIS RECENTE ----------
  const ts = data
    ? Object.values(data)
        .map((res) => Date.parse(res.ts))
        .filter((v) => !Number.isNaN(v))
        .sort((a, b) => b - a)[0]
    : undefined;

  const tsIso = ts ? new Date(ts).toISOString() : undefined;

  const valuesByCcm = data
    ? {
        ccm1: data.ccm1?.values ?? {},
        ccm2: data.ccm2?.values ?? {},
      }
    : null;

  const metaByCcm = data
    ? {
        ccm1: data.ccm1?.meta ?? {},
        ccm2: data.ccm2?.meta ?? {},
      }
    : null;

  return {
    ts: tsIso,
    values: aliasedValues,
    meta: mergedMeta,
    valuesMerged: aliasedValues,
    metaMerged: mergedMeta,
    valuesByCcm,
    metaByCcm,
    loading,
    error,
    warning,
  };
}
