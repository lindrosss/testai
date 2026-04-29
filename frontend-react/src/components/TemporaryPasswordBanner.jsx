import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function TemporaryPasswordBanner() {
  const { user } = useAuth();

  if (!user?.has_temporary_password) return null;

  return (
    <div className="sticky top-0 z-20 border-b border-indigo-200 bg-indigo-50 px-6 py-3 shrink-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-indigo-950">
          <span className="font-medium">Вы вошли с временным паролем.</span>{' '}
          Рекомендуем заменить его на постоянный.
        </p>
        <Link
          to="/profile#change-password"
          className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-700"
        >
          Сменить пароль
        </Link>
      </div>
    </div>
  );
}
