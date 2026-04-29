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
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={() => onClose?.()}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="relative px-5 py-4 border-b border-slate-200">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent" />
            <div className="min-w-0">
              <div className="relative text-sm font-semibold text-slate-900">
                Справка: логика приложения
              </div>
              <div className="relative text-xs text-slate-500">
                Калькулятор “под ключ” + параметры + перезвонить + бот (демо)
              </div>
            </div>
            <button
              onClick={() => onClose?.()}
              className="absolute right-4 top-4 rounded-xl px-3 py-1.5 text-sm text-slate-700 hover:bg-white/70"
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
                  <span className="font-medium">Параметры</span>: витрина зависимостей
                  по моделям — “откуда везём” (привязка к модели), мощность двигателя и
                  расчёт утильсбора (в демо), чтобы было видно, как параметры связаны
                  с маркой/моделью.
                </li>
                <li>
                  <span className="font-medium">Перезвонить</span>: история заявок
                  из <span className="font-medium">бота</span> (номер после “перезвоните”)
                  и из <span className="font-medium">калькулятора</span>, если есть история
                  расчётов — тогда можно оставить номер и в заявку подтянется эта история.
                  Для заявок можно вести статусы обработки.
                </li>
                <li>
                  <span className="font-medium">Бот</span>: отвечает на простые
                  вопросы и принимает заявку “перезвоните”.
                </li>
              </ul>
            </Section>

            <Section title="История расчётов (в демо)">
              При нажатии “Рассчитать” результат может кэшироваться, а список последних
              расчётов сохраняется — чтобы удобно сравнивать варианты во время демонстрации.
              Если история не пуста, можно оформить заявку на перезвон прямо с калькулятора.
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-600">
                Подсказка: нажмите <span className="font-semibold">Esc</span>, чтобы закрыть окно.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

