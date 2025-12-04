// src/api/api.ts
const RAW_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:9090";

const API_BASE = RAW_BASE.replace(/\/+$/, "");

export function apiUrl(path: string) {
  // path entra tipo "/modbus/tags/all"
  return `${API_BASE}/api${path.replace(/^\/api/, "")}`;
}
