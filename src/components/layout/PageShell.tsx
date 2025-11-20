// src/components/layout/PageShell.tsx
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/auth";
import type { CcmConfig, CcmKey } from "../../config/ccm";

// Logos
import logoLight from "../../assets/sinapse-logo-horizontal.png";
import logoDark from "../../assets/sinapse-logo-horizontal-escuro.png";

import { useTheme } from "../../theme/ThemeContext";

type SectionKey = "gestao" | "dashboard" | "motores";

type Props = PropsWithChildren<{
  config: CcmConfig;
  /** Qual seção está ativa (define destaque no header) */
  section?: SectionKey;
}>;

export function PageShell({ children, config, section = "dashboard" }: Props) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const tabs: { key: CcmKey; label: string }[] = [
    { key: "ccm1", label: "CCM 1" },
    { key: "ccm2", label: "CCM 2" },
  ];

const sectionTabs: { key: SectionKey; label: string; path: string }[] = [
  { key: "gestao", label: "Gestão", path: `/ccm/${config.key}/gestao` },
  { key: "dashboard", label: "Dashboard", path: `/ccm/${config.key}` },
  { key: "motores", label: "Motores", path: `/ccm/${config.key}/motores` },
];


  const rootClass = isDark
    ? "min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-50 flex flex-col"
    : "min-h-screen w-full overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col";

  const headerClass = isDark
    ? "w-full border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
    : "w-full border-b border-slate-200 bg-white/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4";

  const mainClass = isDark ? "flex-1 bg-slate-950" : "flex-1 bg-slate-100";

  const chipBase =
    "text-xs px-3 py-1.5 rounded-full border transition-colors";

  const logo = isDark ? logoLight : logoDark;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={rootClass}>
      <header className={headerClass}>
        {/* LEFT: logo + título (apenas em telas >= sm) */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logo}
            alt="Sinapse Soluções e Automação"
            className="h-15 w-auto sm:h-20"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold tracking-tight">
              Painel de Gestão • CooperOeste • {config.displayName}
            </h1>
          </div>
        </div>

        {/* RIGHT: abas CCM + nav de seção + tema + sair */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {/* Abas CCM 1 / CCM 2 */}
          <div
            className={
              (isDark
                ? "bg-slate-900/80 border-slate-800"
                : "bg-slate-100 border-slate-300") +
              " flex items-center gap-2 rounded-full p-1 border"
            }
          >
            {tabs.map((tab) => {
              const active = tab.key === config.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(`/ccm/${tab.key}`)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-emerald-500 text-slate-950"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Nav Dashboard / Motores – agora visível também no mobile */}
          <div
            className={
              (isDark
                ? "bg-slate-900/80 border-slate-800"
                : "bg-slate-50 border-slate-300") +
              " flex items-center gap-1 rounded-full border px-1 py-0.5 text-xs"
            }
          >
            {sectionTabs.map((sec) => {
              const active = section === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => navigate(sec.path)}
                  className={
                    "px-2 sm:px-3 py-1 rounded-full font-medium transition-colors " +
                    (active
                      ? "bg-emerald-500 text-slate-950"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-200")
                  }
                >
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Link para a nova página de gestão geral */}
          <button
            onClick={() => navigate("/gestao")}
            className={
              chipBase +
              " " +
              (isDark
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/20"
                : "border-emerald-600/50 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-100")
            }
            title="Ir para a visão geral dos dois CCMs"
          >
            Gestão
          </button>

          {/* Botão de tema */}
          <button
            onClick={toggleTheme}
            className={
              chipBase +
              " " +
              (isDark
                ? "border-slate-700 hover:border-amber-400 hover:text-amber-200"
                : "border-slate-300 hover:border-slate-500 hover:text-slate-700")
            }
            title={
              isDark
                ? "Alternar para modo claro"
                : "Alternar para modo escuro"
            }
          >
            {isDark ? "☀️ Claro" : "🌙 Escuro"}
          </button>

          {/* Botão sair */}
          <button
            onClick={handleLogout}
            className={
              chipBase +
              " " +
              (isDark
                ? "border-slate-700 hover:border-rose-500 hover:text-rose-300"
                : "border-slate-300 hover:border-rose-500 hover:text-rose-600")
            }
          >
            Sair
          </button>
        </div>
      </header>

      <main className={mainClass}>{children}</main>
    </div>
  );
}
