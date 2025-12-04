// src/api/commands.ts
import { apiUrl } from "./api";
import type { CcmKey } from "../config/ccm";

/**
 * Aciona o comando de RESET por pulso para um CCM específico.
 * @param ccm "ccm1" ou "ccm2"
 */
export async function postModbusReset(ccm: CcmKey): Promise<void> {
  const url = apiUrl(`/modbus/${ccm}/reset`);
  const r = await fetch(url, { method: "POST" });

  if (!r.ok) {
    throw new Error(`Falha ao enviar comando de reset (HTTP ${r.status})`);
  }
}

/**
 * Aciona o comando de EMERGENCIA (retentivo) para um CCM específico.
 * @param ccm "ccm1" ou "ccm2"
 */
export async function postModbusEmergency(ccm: CcmKey): Promise<void> {
  const url = apiUrl(`/modbus/${ccm}/emergency`);
  const r = await fetch(url, { method: "POST" });

  if (!r.ok) {
    throw new Error(`Falha ao enviar comando de emergência (HTTP ${r.status})`);
  }
}

/**
 * Limpa manualmente o comando de EMERGENCIA.
 */
export async function postClearEmergency(): Promise<void> {
  const url = apiUrl("/cmd/parar/clear");
  const r = await fetch(url, { method: "POST" });

  if (!r.ok) {
    throw new Error(`Falha ao limpar comando de emergência (HTTP ${r.status})`);
  }
}
