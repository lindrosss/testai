import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { Alert } from '../../components/Common/Alert';
import { Loading } from '../../components/Common/Loading';
import { fetchCallbackRequests, updateCallbackMessage, updateCallbackStatus } from '../../api/demoCallbacks';

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'new', label: 'Новый' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'success', label: 'Успех' },
  { value: 'failed', label: 'Не успех' },
];

const QUICK_STATUSES = [
  { value: 'new', label: 'Новый', activeCls: 'border-rose-300 bg-rose-50 text-rose-900' },
  { value: 'in_progress', label: 'В работе', activeCls: 'border-amber-300 bg-amber-50 text-amber-950' },
  { value: 'success', label: 'Успех', activeCls: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
  { value: 'failed', label: 'Не успех', activeCls: 'border-slate-300 bg-slate-100 text-slate-900' },
];

function statusLabel(v) {
  return STATUS_OPTIONS.find((o) => o.value === v)?.label || v || '—';
}

function statusPillClass(v) {
  switch (v) {
    case 'new':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'in_progress':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'failed':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function QuickStatusButtons({ current, disabled, onPick }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {QUICK_STATUSES.map((s) => {
        const active = String(current) === s.value;
        return (
          <button
            key={s.value}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s.value)}
            className={[
              'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
              active
                ? `${s.activeCls} shadow-sm`
                : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white hover:-translate-y-[1px]',
              disabled ? 'opacity-60 hover:translate-y-0' : '',
            ].join(' ')}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function CallbackMessageField({ id, value, disabled, onSaved, onError }) {
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [id, value]);

  async function saveIfChanged() {
    const next = draft;
    const prev = value ?? '';
    if (next === prev) return;

    try {
      await updateCallbackMessage(id, next === '' ? null : next);
      await onSaved?.();
    } catch (e) {
      setDraft(prev);
      onError?.(e?.response?.data?.message || 'Не удалось сохранить сообщение.');
    }
  }

  return (
    <textarea
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => saveIfChanged()}
      rows={3}
      className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none transition-shadow focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 disabled:opacity-60"
      placeholder="Заметка по заявке (сохранится при потере фокуса)…"
    />
  );
}

export function CallbackRequests() {
  const [status, setStatus] = useState('');
  const key = useMemo(() => ['demo:callbacks', status], [status]);
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    fetchCallbackRequests(status ? { status } : undefined),
  );

  const rows = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const [busyId, setBusyId] = useState(null);
  const [opError, setOpError] = useState(null);

  async function onChangeStatus(id, next) {
    setOpError(null);
    setBusyId(id);
    try {
      await updateCallbackStatus(id, next);
      await mutate();
      await globalMutate('demo:callbacks:summary');
    } catch (e) {
      setOpError(e?.response?.data?.message || 'Не удалось обновить статус.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Перезвонить</h1>
            <p className="text-sm text-slate-600">
              История заявок из бота. Меняйте статус, чтобы показать “обработку” лида.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm outline-none transition-shadow focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => mutate()}
              className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Обновить
            </button>
          </div>
        </div>
      </div>

      {opError ? <Alert type="error" title="Ошибка" message={opError} /> : null}

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Заявки</div>
          <div className="text-xs text-slate-500">{total ? `Всего: ${total}` : null}</div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <Loading label="Загружаю заявки…" />
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert type="error" title="Не удалось загрузить" message="Проверьте API /api/demo/callback-requests." />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Пока нет заявок.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Дата</th>
                  <th className="px-6 py-3 text-left font-medium">Телефон</th>
                  <th className="px-6 py-3 text-left font-medium">Тема</th>
                  <th className="px-6 py-3 text-left font-medium">Сообщение</th>
                  <th className="px-6 py-3 text-left font-medium">Статус</th>
                  <th className="px-6 py-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/70 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-3 font-mono tabular-nums text-slate-900">
                      {r.phone}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{r.topic || 'callback'}</td>
                    <td className="px-6 py-3 text-slate-700 max-w-xl align-top">
                      <CallbackMessageField
                        id={r.id}
                        value={r.message}
                        disabled={busyId === r.id}
                        onSaved={async () => {
                          await mutate();
                          await globalMutate('demo:callbacks:summary');
                        }}
                        onError={(msg) => setOpError(msg)}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusPillClass(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <QuickStatusButtons
                        current={r.status || 'new'}
                        disabled={busyId === r.id}
                        onPick={(next) => {
                          if (next === (r.status || 'new')) return;
                          onChangeStatus(r.id, next);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

