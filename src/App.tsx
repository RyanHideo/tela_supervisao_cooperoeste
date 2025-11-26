// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";

import {
  CCM_CONFIGS,
  DEFAULT_CCM,
  isCcmKey,
  type CcmKey,
} from "./config/ccm";
import { MotorsPage } from "./components/motors/MotorsPage";
import { ManagementPage } from "./components/management/ManagementPage";
/* ---------- Helpers de rota ---------- */

function resolveConfigFromParams(): [CcmKey | null, (typeof CCM_CONFIGS)[CcmKey] | null] {
  const params = useParams<{ ccmId: string }>();
  const id = params.ccmId;

  if (!id || !isCcmKey(id)) return [null, null];

  const cfg = CCM_CONFIGS[id];
  return [id, cfg];
}

/** Rota da visão geral (dashboard) */
function CcmDashboardRoute() {
  const [id, config] = resolveConfigFromParams();

  if (!id || !config) {
    return <Navigate to={`/ccm/${DEFAULT_CCM}`} replace />;
  }

  return (
    <PageShell config={config} section="dashboard">
      <Dashboard config={config} />
    </PageShell>
  );
}

/** Rota da lista de motores */
function CcmMotorsRoute() {
  const [id, config] = resolveConfigFromParams();

  if (!id || !config) {
    return <Navigate to={`/ccm/${DEFAULT_CCM}/motores`} replace />;
  }

  return (
    <PageShell config={config} section="motores">
      <MotorsPage config={config} />
    </PageShell>
  );
}

/** Rota da página de Gestão (visão agregada dos dois CCMs) */
function CcmManagementRoute() {
  const [id, config] = resolveConfigFromParams();

  if (!id || !config) {
    return <Navigate to={`/ccm/${DEFAULT_CCM}/gestao`} replace />;
  }

  return (
    <PageShell config={config} section="gestao">
      <ManagementPage />
    </PageShell>
  );
}

/* ---------- App ---------- */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login público */}
        <Route path="/login" element={<LoginPage />} />


          
    
                {/* Página de Gestão protegida */}
        <Route
          path="/ccm/:ccmId/gestao"
          element={
            <ProtectedRoute>
              <CcmManagementRoute />
            </ProtectedRoute>
          }
        />

        {/* Redireciona "/" para o CCM default (dashboard) */}
        <Route
          path="/"
          element={<Navigate to={`/ccm/${DEFAULT_CCM}`} replace />}
        />

        {/* Visão geral (dashboard) protegida */}
        <Route
          path="/ccm/:ccmId"
          element={
            <ProtectedRoute>
              <CcmDashboardRoute />
            </ProtectedRoute>
          }
        />

        {/* Página de Motores protegida */}
        <Route
          path="/ccm/:ccmId/motores"
          element={
            <ProtectedRoute>
              <CcmMotorsRoute />
            </ProtectedRoute>
          }
        />

        {/* Fallback para qualquer rota desconhecida */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
