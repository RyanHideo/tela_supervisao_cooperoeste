// src/api/consumption.ts
import { apiUrl } from "./api";
import type { CcmKey } from "../config/ccm";

/**
 * Envia um comando para zerar o consumo total no CLP.
 * @param ccm "ccm1" ou "ccm2"
 */
export async function postResetConsumption(ccm: CcmKey): Promise<void> {
  const r = await fetch(apiUrl(`/consumption/${ccm}/reset`), { method: "POST" });
  if (!r.ok) {
    throw new Error(`Falha ao zerar consumo (HTTP ${r.status})`);
  }
}

/**
 * Busca a data e hora em que o último reset de consumo foi acionado.
 * @param ccm "ccm1" ou "ccm2"
 */
export async function getConsumptionResetDate(ccm: CcmKey): Promise<{ date: string }> {
  const r = await fetch(apiUrl(`/consumption/${ccm}/reset-date`), { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Falha ao buscar data de reset do consumo (HTTP ${r.status})`);
  }
  return r.json();
}
