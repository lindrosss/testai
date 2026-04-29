import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { EmailVerificationBanner } from '../EmailVerificationBanner.jsx';
import { TemporaryPasswordBanner } from '../TemporaryPasswordBanner.jsx';

const navCls = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col">
        <Link to="/dashboard" className="text-lg font-bold text-indigo-600 mb-6">
          Vameo
        </Link>
        <nav className="space-y-1 flex-1">
          <NavLink to="/dashboard" className={navCls}>
            Дашборд
          </NavLink>
          <NavLink to="/events" className={navCls}>
            События
          </NavLink>
          <NavLink to="/profile" className={navCls}>
            Профиль
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <EmailVerificationBanner />
        <TemporaryPasswordBanner />
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <span className="text-slate-500 text-sm hidden sm:block">
            Учёт групповых расходов
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-800">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate max-w-[200px]">{user?.email}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-red-600"
            >
              Выйти
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
