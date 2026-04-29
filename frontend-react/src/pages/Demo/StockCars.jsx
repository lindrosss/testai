import useSWR from 'swr';
import { Alert } from '../../components/Common/Alert';
import { Loading } from '../../components/Common/Loading';
import { fetchAutoReference } from '../../api/demoAuto';

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

export function StockCars() {
  const { data: ref, error: refError, isLoading: refLoading } = useSWR('demo:auto:reference', fetchAutoReference);
  const carModels = ref?.car_models || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Зависимости по моделям</h1>
            <p className="text-sm text-slate-600">
              Эта витрина показывает, как параметры расчёта зависят от выбранной марки/модели: откуда везём,
              мощность двигателя и утильсбор (в демо).
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Источник данных: справочник моделей (демо)
          </div>
        </div>
      </div>

      {refError ? (
        <Alert type="error" title="Справочники недоступны" message="Не могу загрузить справочник моделей." />
      ) : null}

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Модели</div>
          <div className="text-xs text-slate-500">{carModels.length ? `Всего: ${carModels.length}` : null}</div>
        </div>

        {refLoading ? (
          <div className="p-6">
            <Loading label="Загружаю справочник…" />
          </div>
        ) : refError ? (
          <div className="p-6">
            <Alert type="error" title="Не удалось загрузить" message="Проверьте API /api/demo/auto/reference." />
          </div>
        ) : carModels.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Пока нет моделей для отображения.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Марка / модель</th>
                  <th className="px-6 py-3 text-left font-medium">Откуда везём</th>
                  <th className="px-6 py-3 text-left font-medium">Мощность</th>
                  <th className="px-6 py-3 text-left font-medium">Утильсбор</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {carModels.map((m) => (
                  <tr key={m.id} className="hover:bg-white/70 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">
                        {m.brand} {m.model}
                      </div>
                      <div className="text-xs text-slate-500">
                        {m.market_price_usd ? `Ориентир по рынку: ${money(m.market_price_usd)}` : 'Ориентир по рынку: —'}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {m.shipping_origin?.name ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                          {m.shipping_origin.name}
                        </span>
                      ) : (
                        <span className="text-rose-700 text-xs">не настроено</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-700 font-mono tabular-nums">
                      {m.engine_power_hp} hp
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-semibold text-slate-900 font-mono tabular-nums">
                        {m.recycling?.fee_usd != null ? money(m.recycling.fee_usd) : '—'}
                      </div>
                      {m.recycling?.base_usd != null ? (
                        <div className="text-xs text-slate-500">
                          база {money(m.recycling.base_usd)} · {money(m.recycling.per_hp_usd)} / hp
                        </div>
                      ) : null}
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

