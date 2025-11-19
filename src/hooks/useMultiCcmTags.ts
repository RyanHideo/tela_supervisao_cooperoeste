// src/hooks/useMultiCcmTags.ts
import { useEffect, useState } from "react";
import { getTagsValues, type NormalizedTags } from "../api/tags";
import { CCM_CONFIGS, type CcmKey } from "../config/ccm";

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

const CCM_KEYS = Object.keys(CCM_CONFIGS) as CcmKey[];

export function useMultiCcmTags(
  options: UseMultiCcmTagsOptions = {}
): UseMultiCcmTagsResult {
  const { intervalMs = 1500 } = options;

  const [data, setData] = useState<NormalizedTags[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchOnce() {
      const results = await Promise.all(
        CCM_KEYS.map(async (key) => {
          try {
            const res = await getTagsValues(key);
            return { key, res } as const;
          } catch (err: any) {
            return { key, error: err?.message ?? "Erro ao buscar tags" } as const;
          }
        })
      );

      if (!mounted) return;

      const ok = results.filter((r) => "res" in r) as { key: CcmKey; res: NormalizedTags }[];
      const failed = results.filter((r) => "error" in r) as { key: CcmKey; error: string }[];

      if (ok.length === 0) {
        setError(
          failed.length
            ? `Falha ao buscar dados: ${failed
                .map((f) => `${f.key.toUpperCase()}: ${f.error}`)
                .join("; ")}`
            : "Falha ao buscar dados"
        );
        setLoading(false);
        return;
      }

      setData(ok.map((r) => r.res));
      setError(null);
      setWarning(
        failed.length
          ? `Comunicação parcial: ${failed
              .map((f) => f.key.toUpperCase())
              .join(", ")}`
          : null
      );
      setLoading(false);
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

  const mergedValues: Record<string, number | boolean | undefined> = {};
  const mergedMeta: NormalizedTags["meta"] = {};

  if (data) {
    data.forEach((res) => {
      Object.assign(mergedValues, res.values);
      Object.assign(mergedMeta, res.meta);
    });
  }

  const ts = data
    ?.map((res) => Date.parse(res.ts))
    .filter((v) => !Number.isNaN(v))
    .sort((a, b) => b - a)[0];

  const tsIso = ts ? new Date(ts).toISOString() : undefined;

  return {
    ts: tsIso,
    values: mergedValues,
    meta: mergedMeta,
    loading,
    error,
    warning,
  };
}
