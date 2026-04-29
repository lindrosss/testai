import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { ChatWidget } from '../ChatWidget';
import { HelpModal } from '../HelpModal';

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'px-3 py-2 rounded-xl text-sm font-medium transition',
          isActive
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70 hover:text-slate-900',
        ].join(' ')
      }
      end
    >
      {children}
    </NavLink>
  );
}

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 17.25v.5m0-11c-2.761 0-5 1.79-5 4h2c0-1.074 1.343-2 3-2s3 .926 3 2c0 1.333-1.04 2.002-2.038 2.642-.998.64-1.962 1.26-1.962 2.608V16h2v-.5c0-.344.304-.61 1.043-1.084C15.34 13.62 17 12.556 17 10.75c0-2.21-2.239-4-5-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function PublicLayout() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10">
        <div className="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-2xl shadow-sm app-gradient-animate bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400" />
              <div className="leading-tight min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  Auto “под ключ”
                </div>
                <div className="text-xs text-slate-500 truncate">
                  демо‑проект для собеседования (Laravel + React)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1 rounded-2xl bg-white/70 border border-slate-200 p-1 shadow-sm">
                <TabLink to="/demo/auto">Калькулятор</TabLink>
                <TabLink to="/demo/stock">Склад</TabLink>
              </div>

              <div className="sm:hidden flex items-center gap-1 rounded-2xl bg-white/70 border border-slate-200 p-1 shadow-sm">
                <TabLink to="/demo/auto">Calc</TabLink>
                <TabLink to="/demo/stock">Stock</TabLink>
              </div>

              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="group relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm
                  bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 app-gradient-animate
                  hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-transform
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
              >
                <span className="absolute -inset-0.5 rounded-[18px] bg-gradient-to-r from-indigo-500/40 via-sky-500/35 to-cyan-400/35 blur opacity-70 group-hover:opacity-100 transition" />
                <span className="relative inline-flex items-center gap-2">
                  <HelpIcon />
                  Справка
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 app-enter">
        <Outlet />
      </main>

      <ChatWidget />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

