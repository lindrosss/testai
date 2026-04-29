import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { isEmailVerified } from '../utils/emailVerification.js';

export function EmailVerificationBanner() {
  const { user, getUser, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [hint, setHint] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const verified = isEmailVerified(user);

  const refreshStatus = useCallback(async () => {
    setRefreshing(true);
    setHint('');
    try {
      await getUser();
    } finally {
      setRefreshing(false);
    }
  }, [getUser]);

  useEffect(() => {
    if (verified) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshStatus();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [verified, refreshStatus]);

  if (!user) return null;
  if (verified) return null;

  const resend = async () => {
    setSending(true);
    setHint('');
    try {
      await resendVerificationEmail();
      setHint('Письмо отправлено. Проверьте почту и ссылку в письме.');
    } catch (e) {
      setHint(e.response?.data?.message || 'Не удалось отправить письмо.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sticky top-0 z-20 border-b border-amber-200 bg-amber-50 px-6 py-3 shrink-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-amber-950">
          <span className="font-medium">Подтвердите email.</span>{' '}
          Мы отправили ссылку на <span className="font-medium">{user?.email}</span>. Без подтверждения
          нельзя создавать или менять события, расходы и платежи.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {sending ? 'Отправка…' : 'Отправить письмо ещё раз'}
          </button>
          <button
            type="button"
            onClick={refreshStatus}
            disabled={refreshing}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            {refreshing ? 'Проверка…' : 'Уже подтвердил'}
          </button>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-amber-900/90">{hint}</p>}
    </div>
  );
}
