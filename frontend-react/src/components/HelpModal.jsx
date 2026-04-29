import { useEffect } from 'react';

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </section>
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
                  <span className="font-medium">Склад</span>: список “авто в наличии”
                  с актуальными статусами.
                </li>
                <li>
                  <span className="font-medium">Бот</span>: отвечает на простые
                  вопросы и принимает заявку “перезвоните”.
                </li>
              </ul>
            </Section>

            <Section title="Откуда берётся “откуда везём”">
              Направление доставки привязано к выбранной модели. Клиент не выбирает
              его в форме — оно показывается в результате расчёта.
            </Section>

            <Section title="Формула (в демо)">
              Итоговая стоимость складывается из:
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Стоимость авто</span> (введённая сумма
                  в демо)
                </li>
                <li>
                  <span className="font-medium">Таможенная пошлина</span>
                </li>
                <li>
                  <span className="font-medium">Утильсбор</span> —{' '}
                  <span className="font-medium">привязан к мощности двигателя</span>{' '}
                  (чем выше мощность, тем выше утильсбор)
                </li>
                <li>
                  <span className="font-medium">Логистика</span> (зависит от
                  направления доставки)
                </li>
                <li>
                  <span className="font-medium">Комиссия сервиса</span>
                </li>
              </ul>
            </Section>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">
                Подсказка: нажмите <span className="font-medium">Esc</span>, чтобы
                закрыть окно.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

