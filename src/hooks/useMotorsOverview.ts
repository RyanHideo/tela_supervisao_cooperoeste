// src/hooks/useMotorsOverview.ts
import { useEffect, useState } from "react";
import { getMotorsOverview, type MotorOverviewItem } from "../api/motors";

type UseMotorsOverviewOptions = {
  intervalMs?: number;
};

export type MotorsOverviewCounts = {
  total: number;
  ativos: number;
  falha: number;
  desligados: number;
  loading: boolean;
  error: string | null;
};

export function useMotorsOverview(
  options: UseMotorsOverviewOptions = {}
): MotorsOverviewCounts {
  const { intervalMs = 5000 } = options;

  const [items, setItems] = useState<MotorOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchOnce() {
      try {
        const data = await getMotorsOverview();
        if (!mounted) return;
        setItems(data);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Erro ao buscar overview de motores");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOnce();
    timer = window.setInterval(fetchOnce, intervalMs);

    return () => {
      mounted = false;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [intervalMs]);

  // Agrupamento: prioridade falha > ligado > desligado
  let total = items.length;
  let ativos = 0;
  let falha = 0;
  let desligados = 0;

  for (const m of items) {
    const hasFault = !!m.fault && m.fault !== 0;
    const isOn = !!m.status && m.status !== 0;

    if (hasFault) {
      falha++;
    } else if (isOn) {
      ativos++;
    } else {
      desligados++;
    }
  }

  return { total, ativos, falha, desligados, loading, error };
}
