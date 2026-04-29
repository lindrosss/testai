import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { withInviteQuery } from '../../components/inviteQuery.js';

export function Login() {
  const [searchParams] = useSearchParams();
  const invite = searchParams.get('invite') || '';
  const notice = searchParams.get('notice') || '';
  const noticeMsg = searchParams.get('msg') || '';
  const prefilledEmail = searchParams.get('email') || '';
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  const noticeBanner = useMemo(() => {
    if (!noticeMsg) return null;
    if (notice === 'error') {
      return { kind: 'error', text: noticeMsg };
    }
    return { kind: 'info', text: noticeMsg };
  }, [notice, noticeMsg]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      await login(email, password);
      await navigate('/demo/auto', { replace: true });
    } catch {
      setLocalError('Неверный email или пароль');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Вход</h1>
      {noticeBanner && (
        <p
          className={
            noticeBanner.kind === 'error'
              ? 'mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-900'
              : 'mb-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800'
          }
        >
          {noticeBanner.text}
        </p>
      )}
      {invite && (
        <p className="mb-4 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-indigo-900">
          Вы перешли по приглашению. Войдите или зарегистрируйтесь.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {(localError || error) && (
          <p className="text-sm text-red-600">{localError || error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link to={withInviteQuery('/register', invite)} className="text-indigo-600 hover:underline">
          Регистрация
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link to="/forgot-password" className="text-slate-500 hover:text-indigo-600">
          Забыли пароль?
        </Link>
      </p>
    </div>
  );
}
