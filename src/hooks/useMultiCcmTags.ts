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
  loading: boolean;
  error: string | null;
  warning: string | null;
};

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

  // ---------- ALIASES PARA AS NOVAS TAGS DO BACK ----------
  const aliasedValues: Record<string, number | boolean | undefined> = {
    ...mergedValues,
  };

  // FATOR DE POTÊNCIA
  if (
    aliasedValues["CCM1_FATOR_POTENCIA"] === undefined &&
    mergedValues["FP"] !== undefined
  ) {
    aliasedValues["CCM1_FATOR_POTENCIA"] = mergedValues["FP"];
  }

  if (
    aliasedValues["CCM2_FATOR_POTENCIA"] === undefined &&
    mergedValues["FP2"] !== undefined
  ) {
    aliasedValues["CCM2_FATOR_POTENCIA"] = mergedValues["FP2"];
  }

  // POTÊNCIA APARENTE (kVA)
  if (
    aliasedValues["CCM1_POTENCIA"] === undefined &&
    (mergedValues["PA"] !== undefined || mergedValues["PA1"] !== undefined)
  ) {
    aliasedValues["CCM1_POTENCIA"] =
      (mergedValues["PA"] as any) ?? (mergedValues["PA1"] as any);
  }

  if (
    aliasedValues["CCM2_POTENCIA"] === undefined &&
    mergedValues["PA2"] !== undefined
  ) {
    aliasedValues["CCM2_POTENCIA"] = mergedValues["PA2"];
  }

  // CONSUMO TOTAL (kWh)
  if (
    aliasedValues["CCM1_CONSUMO_TOTAL"] === undefined &&
    (mergedValues["CONSUMO1"] !== undefined ||
      mergedValues["CONSUMO_TOTAL"] !== undefined)
  ) {
    aliasedValues["CCM1_CONSUMO_TOTAL"] =
      (mergedValues["CONSUMO1"] as any) ??
      (mergedValues["CONSUMO_TOTAL"] as any);
  }

  if (
    aliasedValues["CCM2_CONSUMO_TOTAL"] === undefined &&
    mergedValues["CONSUMO2"] !== undefined
  ) {
    aliasedValues["CCM2_CONSUMO_TOTAL"] = mergedValues["CONSUMO2"];
  }

  // ---------- TS MAIS RECENTE ----------
  const ts = data
    ? Object.values(data)
        .map((res) => Date.parse(res.ts))
        .filter((v) => !Number.isNaN(v))
        .sort((a, b) => b - a)[0]
    : undefined;

  const tsIso = ts ? new Date(ts).toISOString() : undefined;

  return {
    ts: tsIso,
    values: aliasedValues,
    meta: mergedMeta,
    loading,
    error,
    warning,
  };
}
