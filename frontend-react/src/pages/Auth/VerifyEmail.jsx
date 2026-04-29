import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Ссылка из письма ведёт сюда (?target=...), а не сразу на API — иначе почтовые сканеры
 * дергают GET /api/auth/verify-email и помечают почту подтверждённой без пользователя.
 */
function parseVerifyTarget(target) {
  if (!target || typeof target !== 'string') return null;
  let u;
  try {
    u = new URL(target);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!/\/api\/auth\/verify-email\/[^/]+\/[^/?#]+\/?$/.test(u.pathname)) return null;
  return target;
}

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const target = useMemo(() => parseVerifyTarget(searchParams.get('target')), [searchParams]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const goDashboard = (kind, message) => {
    const params = new URLSearchParams();
    params.set('notice', kind);
    if (message) params.set('msg', message);
    navigate(`/dashboard?${params.toString()}`, { replace: true });
  };

  const go = async () => {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      const u = new URL(target);
      const pathWithQuery = `${u.pathname}${u.search}`;
      const { data } = await api.get(pathWithQuery.replace(/^\/api/, ''));
      const message = typeof data?.message === 'string' ? data.message : '';
      await getUser().catch(() => undefined);

      if (message === 'Email already verified.') {
        goDashboard('info', 'Email уже подтверждён.');
        return;
      }
      if (message === 'Email verified successfully.') {
        goDashboard('success', 'Email успешно подтверждён.');
        return;
      }

      goDashboard('success', message || 'Email подтверждён.');
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.errors?.signature?.[0] ||
        e.message ||
        'Не удалось подтвердить email.';
      goDashboard('error', String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Подтверждение email</h1>
        {!target ? (
          <p className="text-sm text-slate-600 mb-6">
            Ссылка неполная или устарела. Запросите новое письмо в приложении или зарегистрируйтесь
            снова.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-6">
              Нажмите кнопку, чтобы подтвердить адрес. Так мы избегаем ложного подтверждения из-за
              автоматических проверок почты.
            </p>
            {error && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => void go()}
              disabled={busy}
              className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? 'Подтверждаем…' : 'Подтвердить email'}
            </button>
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
