import { useEffect } from 'react';

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function CodeLine({ children }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-800">
      {children}
    </code>
  );
}

export function HelpModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => onClose?.()}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Справка: логика приложения
              </div>
              <div className="text-xs text-slate-500">
                Калькулятор “под ключ” + склад + бот (демо)
              </div>
            </div>
            <button
              onClick={() => onClose?.()}
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              type="button"
            >
              Закрыть
            </button>
          </div>

          <div className="max-h-[72vh] overflow-auto px-5 py-4 space-y-5">
            <Section title="Что делает приложение">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Калькулятор</span>: клиент выбирает
                  модель и вводит сумму → получает итоговую стоимость “под ключ” и
                  детализацию по статьям.
                </li>
                <li>
                  <span className="font-medium">Склад</span>: CRUD таблица “авто в
                  наличии” со статусами (<CodeLine>in_stock</CodeLine>,{' '}
                  <CodeLine>reserved</CodeLine>, <CodeLine>sold</CodeLine>).
                </li>
                <li>
                  <span className="font-medium">Бот</span>: отвечает на простые
                  вопросы и принимает заявку “перезвоните”.
                </li>
              </ul>
            </Section>

            <Section title="Откуда берётся “откуда везём”">
              Направление доставки привязано к модели в базе данных (
              <CodeLine>car_models.shipping_origin_id</CodeLine>). Клиент не выбирает
              его в форме — оно показывается в результате расчёта.
            </Section>

            <Section title="Формула (в демо)">
              Итог:
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-800">
                total = purchase + customsDuty + recyclingFee + logistics + commission
              </div>
              <div className="mt-2 text-xs text-slate-600">
                purchase — введённая сумма (демо‑допущение “цена покупки”).
              </div>
            </Section>

            <Section title="Основные сущности БД">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <CodeLine>shipping_origins</CodeLine> — направления/страны
                  отправления (логистика, сроки)
                </li>
                <li>
                  <CodeLine>car_models</CodeLine> — справочник моделей (бренд, модель,
                  мощность) + привязка направления доставки
                </li>
                <li>
                  <CodeLine>stock_cars</CodeLine> — “авто в наличии”
                </li>
                <li>
                  <CodeLine>callback_requests</CodeLine> — заявки “перезвоните”
                </li>
              </ul>
            </Section>

            <Section title="Публичное API (демо)">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <CodeLine>GET /api/demo/auto/reference</CodeLine> — список моделей
                </li>
                <li>
                  <CodeLine>POST /api/demo/auto/calculate</CodeLine> — расчет (
                  <CodeLine>car_model_id</CodeLine>, <CodeLine>budget_usd</CodeLine>)
                </li>
                <li>
                  <CodeLine>GET /api/demo/stock-cars</CodeLine> — склад
                </li>
                <li>
                  <CodeLine>POST /api/demo/bot/message</CodeLine> — сообщения бота
                </li>
              </ul>
            </Section>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">
                Подсказка: нажмите <CodeLine>Esc</CodeLine> чтобы закрыть окно.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

