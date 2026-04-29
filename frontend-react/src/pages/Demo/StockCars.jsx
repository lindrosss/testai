import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Alert } from '../../components/Common/Alert';
import { Loading } from '../../components/Common/Loading';
import {
  createStockCar,
  deleteStockCar,
  fetchAutoReference,
  fetchStockCars,
  updateStockCar,
} from '../../api/demoAuto';

function money(n) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

function StatusPill({ status }) {
  const map = {
    in_stock: { label: 'В наличии', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    reserved: { label: 'Резерв', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    sold: { label: 'Продано', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  };
  const v = map[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${v.cls}`}>
      {v.label}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              Закрыть
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function StockCars() {
  const { data: ref, error: refError, isLoading: refLoading } = useSWR(
    'demo:auto:reference',
    fetchAutoReference,
  );
  const carModels = ref?.car_models || [];
  const origins = ref?.shipping_origins || [];

  const [statusFilter, setStatusFilter] = useState('');
  const listKey = useMemo(() => ['demo:stock', statusFilter], [statusFilter]);
  const {
    data: list,
    error: listError,
    isLoading: listLoading,
    mutate,
  } = useSWR(listKey, () => fetchStockCars(statusFilter ? { status: statusFilter } : undefined));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const cars = list?.data?.data || [];

  function openCreate() {
    setEditing({
      vin: '',
      car_model_id: '',
      shipping_origin_id: '',
      purchase_price_usd: 25000,
      status: 'in_stock',
      notes: '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing({
      id: row.id,
      vin: row.vin || '',
      car_model_id: row.car_model_id,
      shipping_origin_id: row.shipping_origin_id,
      purchase_price_usd: row.purchase_price_usd,
      status: row.status,
      notes: row.notes || '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function onSave(e) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const payload = {
        vin: editing.vin || null,
        car_model_id: Number(editing.car_model_id),
        shipping_origin_id: Number(editing.shipping_origin_id),
        purchase_price_usd: Number(editing.purchase_price_usd),
        status: editing.status,
        notes: editing.notes || null,
      };
      if (editing.id) {
        await updateStockCar(editing.id, payload);
      } else {
        await createStockCar(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await mutate();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Не удалось сохранить. Проверьте, что заполнены все поля.';
      setFormError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Удалить запись?')) return;
    setBusy(true);
    try {
      await deleteStockCar(id);
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Склад клиента</h1>
            <p className="text-sm text-slate-600">
              Таблица “авто в наличии” — хранит данные, которые подходят под формулу расчёта.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">Все статусы</option>
              <option value="in_stock">В наличии</option>
              <option value="reserved">Резерв</option>
              <option value="sold">Продано</option>
            </select>
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              disabled={refLoading || !!refError}
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {refError ? (
        <Alert type="error" title="Справочники недоступны" message="Не могу загрузить модели/направления." />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Позиции</div>
          <div className="text-xs text-slate-500">
            {list?.data?.total ? `Всего: ${list.data.total}` : null}
          </div>
        </div>

        {listLoading ? (
          <div className="p-6">
            <Loading label="Загружаю склад…" />
          </div>
        ) : listError ? (
          <div className="p-6">
            <Alert type="error" title="Не удалось загрузить склад" message="Проверьте API /api/demo/stock-cars." />
          </div>
        ) : cars.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Пока пусто. Добавьте первую позицию.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">VIN</th>
                  <th className="px-6 py-3 text-left font-medium">Модель</th>
                  <th className="px-6 py-3 text-left font-medium">Откуда</th>
                  <th className="px-6 py-3 text-left font-medium">Цена покупки</th>
                  <th className="px-6 py-3 text-left font-medium">Статус</th>
                  <th className="px-6 py-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cars.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-700">
                      {c.vin || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">
                        {c.car_model?.brand} {c.car_model?.model}
                      </div>
                      <div className="text-xs text-slate-500">{c.car_model?.engine_power_hp} hp</div>
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {c.shipping_origin?.name}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{money(c.purchase_price_usd)}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                        disabled={busy}
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="rounded-lg px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                        disabled={busy}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing?.id ? 'Редактирование позиции' : 'Новая позиция'}
        onClose={() => {
          if (busy) return;
          setModalOpen(false);
          setEditing(null);
        }}
      >
        {!editing ? null : (
          <form onSubmit={onSave} className="grid gap-4 md:grid-cols-2">
            {formError ? (
              <div className="md:col-span-2">
                <Alert type="error" title="Ошибка" message={formError} />
              </div>
            ) : null}

            <label className="block md:col-span-2">
              <div className="text-sm font-medium text-slate-800">VIN</div>
              <input
                value={editing.vin}
                onChange={(e) => setEditing((s) => ({ ...s, vin: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="опционально"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-800">Модель</div>
              <select
                value={editing.car_model_id}
                onChange={(e) => setEditing((s) => ({ ...s, car_model_id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                required
                disabled={refLoading || !!refError}
              >
                <option value="" disabled>
                  Выберите…
                </option>
                {carModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.model} · {m.engine_power_hp} hp
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-800">Откуда</div>
              <select
                value={editing.shipping_origin_id}
                onChange={(e) => setEditing((s) => ({ ...s, shipping_origin_id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                required
                disabled={refLoading || !!refError}
              >
                <option value="" disabled>
                  Выберите…
                </option>
                {origins.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · логистика {money(o.logistics_cost_usd)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-800">Цена покупки (USD)</div>
              <input
                type="number"
                min={1}
                step={100}
                value={editing.purchase_price_usd}
                onChange={(e) => setEditing((s) => ({ ...s, purchase_price_usd: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-800">Статус</div>
              <select
                value={editing.status}
                onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              >
                <option value="in_stock">В наличии</option>
                <option value="reserved">Резерв</option>
                <option value="sold">Продано</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <div className="text-sm font-medium text-slate-800">Заметки</div>
              <textarea
                value={editing.notes}
                onChange={(e) => setEditing((s) => ({ ...s, notes: e.target.value }))}
                className="mt-1 w-full min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="опционально"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (busy) return;
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {busy ? 'Сохраняю…' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

