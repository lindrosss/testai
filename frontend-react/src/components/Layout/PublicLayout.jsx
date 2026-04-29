import { NavLink, Outlet } from 'react-router-dom';
import { ChatWidget } from '../ChatWidget';

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'px-3 py-2 rounded-lg text-sm font-medium transition',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
      end
    >
      {children}
    </NavLink>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                Auto “под ключ”
              </div>
              <div className="text-xs text-slate-500">
                демо‑проект (Laravel API + React)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TabLink to="/demo/auto">Калькулятор</TabLink>
            <TabLink to="/demo/stock">Склад</TabLink>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  );
}

