// src/hooks/useTags.ts
import { useEffect, useState } from "react";
import { getTagsValues, type NormalizedTags } from "../api/tags";
import type { CcmConfig } from "../config/ccm";

type UseTagsOptions = {
  intervalMs?: number;
};

type UseTagsResult = {
  ts?: string;
  values: NormalizedTags["values"];
  meta: NormalizedTags["meta"];
  loading: boolean;
  error: string | null;
};

export function useTags(
  config: CcmConfig,
  options: UseTagsOptions = {}
): UseTagsResult {
  const { intervalMs = 1000 } = options;

  const [data, setData] = useState<NormalizedTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchOnce() {
      try {
        // agora buscamos pelo CCM atual (ccm1 / ccm2)
        const res = await getTagsValues(config.key);
        if (!mounted) return;

        setData(res);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;

        setError(err?.message ?? "Erro ao buscar tags");
        setLoading(false);
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
  }, [config.key, intervalMs]);

  return {
    ts: data?.ts,
    values: data?.values ?? {},
    meta: data?.meta ?? {},
    loading,
    error,
  };
}
