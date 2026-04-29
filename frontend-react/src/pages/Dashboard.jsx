import useSWR from 'swr';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetcher } from '../api/fetcher';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading } from '../components/Common/Loading';
import { formatCents } from '../utils/money';
import { api } from '../api/axios';
import { useMemo, useEffect, useState } from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const { data: eventsPage, isLoading } = useSWR('/events', fetcher);
  const events = eventsPage?.data ?? [];
  const recent = events.slice(0, 5);

  const [totals, setTotals] = useState({ owedToYou: 0, youOwe: 0 });
  const [byType, setByType] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const notice = searchParams.get('notice');
    const msg = searchParams.get('msg');
    const legacyVerified = searchParams.get('verified');

    if (notice === 'success' && msg) {
      setBanner({ kind: 'success', text: msg });
    } else if (notice === 'info' && msg) {
      setBanner({ kind: 'info', text: msg });
    } else if (notice === 'error' && msg) {
      setBanner({ kind: 'error', text: msg });
    } else if (legacyVerified === '1') {
      setBanner({ kind: 'success', text: 'Email успешно подтверждён.' });
    }

    if (notice || msg || legacyVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    const typeCount = {};
    events.forEach((ev) => {
      const k = ev.type_label || ev.type;
      typeCount[k] = (typeCount[k] || 0) + 1;
    });
    setByType(typeCount);
  }, [events]);

  useEffect(() => {
    if (!user?.id || events.length === 0) {
      setTotals({ owedToYou: 0, youOwe: 0 });
      return;
    }
    let cancelled = false;
    (async () => {
      let owedToYou = 0;
      let youOwe = 0;
      await Promise.all(
        events.map(async (ev) => {
          try {
            const { data } = await api.get(`/events/${ev.id}/balances`);
            const rows = data.data ?? [];
            const mine = rows.find((r) => r.user_id === user.id);
            if (mine) {
              const b = mine.balance_cents;
              if (b > 0) owedToYou += b;
              if (b < 0) youOwe += -b;
            }
          } catch {
            /* ignore */
          }
        }),
      );
      if (!cancelled) {
        setTotals({ owedToYou, youOwe });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [events, user?.id]);

  const chartMax = useMemo(() => {
    const vals = Object.values(byType);
    return Math.max(...vals, 1);
  }, [byType]);

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800">Привет, {user?.name}</h1>

      {banner?.kind === 'success' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {banner.text}
        </div>
      )}
      {banner?.kind === 'info' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
          {banner.text}
        </div>
      )}
      {banner?.kind === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {banner.text}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Вам должны</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCents(totals.owedToYou)}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Вы должны</p>
          <p className="text-2xl font-bold text-amber-900">{formatCents(totals.youOwe)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-slate-800 mb-3">События по типам</h2>
        <div className="space-y-2">
          {Object.entries(byType).map(([label, count]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-32 text-sm text-slate-600 truncate">{label}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(count / chartMax) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 w-8">{count}</span>
            </div>
          ))}
          {Object.keys(byType).length === 0 && (
            <p className="text-sm text-slate-500">Нет данных по событиям</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-slate-800 mb-3">Последние события</h2>
        <ul className="space-y-2">
          {recent.map((e) => (
            <li key={e.id}>
              <Link
                to={`/events/${e.id}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300"
              >
                <span className="font-medium text-slate-800">{e.name}</span>
                <span className="text-slate-500 text-sm ml-2">({e.status_label || e.status})</span>
              </Link>
            </li>
          ))}
          {recent.length === 0 && (
            <p className="text-slate-500 text-sm">
              Событий пока нет —{' '}
              <Link to="/events/create" className="text-indigo-600 hover:underline">
                создать
              </Link>
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
