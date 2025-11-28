// src/hooks/useEfficiency.ts
import { useEffect, useState } from "react";
import {
  getEnergyEfficiency,
  getProductiveEfficiency,
  type EfficiencyResponse,
} from "../api/efficiency";

type UseEfficiencyResult = {
  productive?: EfficiencyResponse;
  energy?: EfficiencyResponse;
  loading: boolean;
  error: string | null;
};

type UseEfficiencyOptions = {
  intervalMs?: number;
};

/**
 * Hook para buscar e manter em cache leve as eficiências:
 *  - /api/efficiency/productive
 *  - /api/efficiency/energy
 */
export function useEfficiency(
  options: UseEfficiencyOptions = {}
): UseEfficiencyResult {
  const { intervalMs = 5000 } = options;

  const [productive, setProductive] = useState<EfficiencyResponse | undefined>();
  const [energy, setEnergy] = useState<EfficiencyResponse | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchOnce() {
      try {
        const [prod, ener] = await Promise.all([
          getProductiveEfficiency(),
          getEnergyEfficiency(),
        ]);

        if (!mounted) return;

        setProductive(prod);
        setEnergy(ener);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Erro ao buscar eficiências");
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
  }, [intervalMs]);

  return {
    productive,
    energy,
    loading,
    error,
  };
}
