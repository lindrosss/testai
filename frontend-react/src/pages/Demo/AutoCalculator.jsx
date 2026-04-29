import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Alert } from '../../components/Common/Alert';
import { Loading } from '../../components/Common/Loading';
import { calculateAutoCost, fetchAutoHistory, fetchAutoReference } from '../../api/demoAuto';

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

export function AutoCalculator() {
  const { data, error, isLoading } = useSWR('demo:auto:reference', fetchAutoReference);
  const {
    data: historyRes,
    error: historyError,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useSWR('demo:auto:history', fetchAutoHistory);
  const carModels = data?.car_models || [];
  const history = historyRes?.data || [];

  const [carModelId, setCarModelId] = useState('');
  const [budgetUsd, setBudgetUsd] = useState(25000);
  const [submitting, setSubmitting] = useState(false);
  const [calc, setCalc] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [formError, setFormError] = useState(null);

  const selectedCar = useMemo(
    () => carModels.find((m) => String(m.id) === String(carModelId)),
    [carModels, carModelId],
  );
  const selectedOrigin = selectedCar?.shipping_origin || null;

  async function onSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitError(null);
    setCalc(null);

    if (!carModelId) {
      setFormError('Пожалуйста, выберите модель автомобиля.');
      return;
    }
    if (!selectedOrigin) {
      setFormError('Для этой модели не настроено направление доставки.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await calculateAutoCost({
        car_model_id: Number(carModelId),
        budget_usd: Number(budgetUsd),
      });
      setCalc(res);
      await mutateHistory();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : null) ||
        'Не удалось выполнить расчёт.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Калькулятор стоимости авто “под ключ”
            </h1>
            <p className="text-sm text-slate-600">
              Модель + бюджет → итог с таможней, логистикой, комиссией и утильсбором.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Валюта: USD (для демо)
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Loading label="Загружаю справочники…" />
          ) : error ? (
            <Alert
              type="error"
              title="Не удалось загрузить справочники"
              message="Проверьте, что Laravel API запущен и доступен по /api."
            />
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium text-slate-800">Модель</div>
                <select
                  value={carModelId}
                  onChange={(e) => {
                    setCarModelId(e.target.value);
                    setFormError(null);
                  }}
                  className="mt-1 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm outline-none transition-shadow focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                >
                  <option value="" disabled>
                    Выберите модель…
                  </option>
                  {carModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} · {m.engine_power_hp} hp
                    </option>
                  ))}
                </select>
                {formError ? (
                  <div className="mt-2 text-xs text-rose-700">{formError}</div>
                ) : null}
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-800">Сумма (USD)</div>
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  value={budgetUsd}
                  onChange={(e) => setBudgetUsd(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm outline-none transition-shadow focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                  required
                />
              </label>

              <div className="md:col-span-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {selectedCar ? (
                    <span>
                      Выбрано: <span className="text-slate-800 font-medium">{selectedCar.brand} {selectedCar.model}</span>{' '}
                      ({selectedCar.engine_power_hp} hp)
                    </span>
                  ) : (
                    <span>Выберите модель.</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm
                    bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 app-gradient-animate
                    hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-transform
                    disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? 'Считаю…' : 'Рассчитать'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {submitError ? (
        <Alert type="error" title="Ошибка расчёта" message={submitError} />
      ) : null}

      {calc ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Итог</div>
                <div className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
                  {money(calc.total_usd)}
                </div>
                {calc.meta?.from_cache ? (
                  <div className="mt-1 text-xs text-slate-500">Результат из кэша (Redis)</div>
                ) : null}
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{calc.input?.car_model?.brand} {calc.input?.car_model?.model}</div>
                <div>{calc.input?.origin?.name}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {Object.entries(calc.breakdown || {}).map(([key, row]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-sm hover:-translate-y-[1px]"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {row.title}
                    </div>
                    {row.details ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {key === 'customs' ? (
                          <span>Ставка: {(row.details.rate * 100).toFixed(1)}%</span>
                        ) : null}
                        {key === 'recycling' ? (
                          <span>
                            База: {money(row.details.base)} · {money(row.details.per_hp)} / hp · {row.details.engine_power_hp} hp
                          </span>
                        ) : null}
                        {key === 'logistics' ? (
                          <span>
                            База направления: {money(row.details.origin_logistics_cost_usd)} · коэффициент бренда: {row.details.brand_factor}
                          </span>
                        ) : null}
                        {key === 'commission' ? (
                          <span>
                            {Math.round(row.details.rate * 100)}% (мин. {money(row.details.min)})
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                    {money(row.amount_usd)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
            <div className="text-sm font-semibold text-slate-900">Что это демонстрирует</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                - справочники в БД (модели/направления)
              </li>
              <li>
                - формула, зависящая от бренда и мощности
              </li>
              <li>
                - логистика по стране отправления
              </li>
              <li>
                - API отдаёт breakdown для прозрачности расчёта
              </li>
            </ul>
            <div className="mt-4 rounded-2xl bg-slate-50/80 border border-slate-200 p-4">
              <div className="text-xs font-medium text-slate-600">
                Демо‑допущение
              </div>
              <div className="mt-1 text-xs text-slate-600">
                “Бюджет” трактуется как цена покупки. В реальном проекте сюда можно
                добавить валюты, калькуляцию по лотам, НДС/акцизы, курс ЦБ и т.д.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">История расчётов</div>
            <div className="mt-1 text-xs text-slate-500">
              Сохраняется в Redis для текущего пользователя (последние 20).
            </div>
          </div>
          <button
            type="button"
            onClick={() => mutateHistory()}
            className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Обновить
          </button>
        </div>

        {historyLoading ? (
          <div className="mt-4">
            <Loading label="Загружаю историю…" />
          </div>
        ) : historyError ? (
          <div className="mt-4">
            <Alert type="error" title="История недоступна" message="Не удалось загрузить историю из Redis." />
          </div>
        ) : history.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">Пока нет расчётов. Нажмите “Рассчитать”.</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Время</th>
                  <th className="px-4 py-3 text-left font-medium">Модель</th>
                  <th className="px-4 py-3 text-left font-medium">Откуда</th>
                  <th className="px-4 py-3 text-left font-medium">Сумма</th>
                  <th className="px-4 py-3 text-left font-medium">Итог</th>
                  <th className="px-4 py-3 text-left font-medium">Кэш</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-white/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {h.at ? new Date(h.at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {h.result?.car_model?.brand ? (
                        <span className="font-medium text-slate-900">
                          {h.result.car_model.brand} {h.result.car_model.model}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{h.result?.origin?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 font-mono tabular-nums">
                      {h.input?.budget_usd != null ? money(h.input.budget_usd) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-semibold font-mono tabular-nums">
                      {h.result?.total_usd != null ? money(h.result.total_usd) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {h.from_cache ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                          да
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">нет</span>
                      )}
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

