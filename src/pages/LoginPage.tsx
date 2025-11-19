// src/pages/LoginPage.tsx
import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginWithPassword, isAuthenticated } from "../auth/auth";
import logoSinapse from "../assets/sinapse-logo-horizontal.png";

export function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, manda direto pro CCM1
  if (isAuthenticated()) {
    return <Navigate to="/ccm/ccm1" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const ok = loginWithPassword(password);

    if (ok) {
      navigate("/ccm/ccm1", { replace: true });
    } else {
      setError("Senha inválida.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logoSinapse}
              alt="Sinapse Soluções e Automação"
              className="h-18 md:h-25"
            />
          </div>

          <h1 className="text-xl font-semibold text-slate-50">
            Acesso a tela de gestão CooperOeste
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Informe a senha para acessar a tela de gestão.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Senha de acesso
            </label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className={
              "w-full rounded-xl bg-emerald-500 " +
              "hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed " +
              "transition-colors text-slate-950 text-sm font-semibold py-2.5"
            }

          >
            {loading ? "Verificando..." : "Entrar"}
          </button>

          <p className="text-[10px] text-slate-500 text-center mt-1">
            Uso interno. Não compartilhe esta senha.
          </p>
        </form>
      </div>
    </div>
  );
}
