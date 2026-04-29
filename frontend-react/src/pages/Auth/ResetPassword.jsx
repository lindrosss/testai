import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Бэкенд открывает: /reset-password?token=...&email=...
 * (совпадает с User::sendPasswordResetNotification во Laravel).
 */
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailFromQuery = searchParams.get('email') || searchParams.get('amp;email') || '';
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const missingToken = useMemo(() => !token, [token]);
  const missingEmail = useMemo(() => !emailFromQuery, [emailFromQuery]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token || !emailFromQuery) {
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await resetPassword(emailFromQuery, password, password_confirmation, token);
      navigate('/login', { replace: true });
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Не удалось сбросить пароль');
    } finally {
      setSubmitting(false);
    }
  };

  if (missingToken || missingEmail) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Сброс пароля</h1>
        <p className="text-sm text-slate-600 mb-4">
          В ссылке нет параметра{' '}
          <code className="bg-slate-100 px-1 rounded">{missingToken ? 'token' : 'email'}</code>.
          Откройте страницу из письма со ссылкой или запросите новое письмо на странице «Забыли пароль».
        </p>
        <p className="text-center text-sm">
          <Link to="/forgot-password" className="text-indigo-600 hover:underline">
            Забыли пароль
          </Link>
          {' · '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Вход
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Новый пароль</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {emailFromQuery}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Подтверждение
          </label>
          <input
            type="password"
            required
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium"
        >
          {submitting ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-indigo-600 hover:underline">
          Ко входу
        </Link>
      </p>
    </div>
  );
}
