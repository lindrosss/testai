import { useEffect, useMemo, useRef, useState } from 'react';
import { sendBotMessage } from '../api/demoBot';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function Bubble({ side, children }) {
  const isBot = side === 'bot';
  return (
    <div className={cx('flex', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cx(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
          isBot
            ? 'bg-slate-100 text-slate-900'
            : 'bg-slate-900 text-white',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [context, setContext] = useState({ next: null });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 'm0',
      side: 'bot',
      text:
        'Здравствуйте! Я помощник.\nМогу подсказать: где мы находимся, как считается стоимость, какие авто в наличии и принять заявку на звонок.',
      quick: ['Где вы находитесь?', 'Как считается стоимость?', 'Какие авто в наличии?', 'Перезвоните мне'],
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  const lastQuick = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].side === 'bot' && Array.isArray(messages[i].quick)) {
        return messages[i].quick;
      }
    }
    return [];
  }, [messages]);

  async function send(text) {
    const trimmed = (text || '').trim();
    if (!trimmed || busy) return;

    const userMsg = { id: `u${Date.now()}`, side: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    try {
      const res = await sendBotMessage({
        message: trimmed,
        context,
      });
      setContext(res.context || { next: null });
      setMessages((prev) => [
        ...prev,
        {
          id: `b${Date.now()}`,
          side: 'bot',
          text: res.reply || 'Ок.',
          quick: res.quick_replies || [],
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `be${Date.now()}`,
          side: 'bot',
          text: 'Не удалось отправить сообщение. Проверьте, что API доступен.',
          quick: lastQuick,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const t = input;
    setInput('');
    void send(t);
  }

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {open ? (
        <div className="w-[340px] sm:w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">Помощник</div>
              <div className="text-xs text-slate-500 truncate">
                быстрые ответы + склад + заявка на звонок
              </div>
            </div>
            <button
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => setOpen(false)}
              type="button"
            >
              Свернуть
            </button>
          </div>

          <div ref={listRef} className="h-[360px] overflow-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                <Bubble side={m.side}>{m.text}</Bubble>
                {m.side === 'bot' && m.quick?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {m.quick.slice(0, 6).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void send(q)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        disabled={busy}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={context?.next === 'callback_phone' ? 'Введите телефон +7999…' : 'Ваш вопрос…'}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {busy ? '…' : 'Отпр.'}
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Это демо‑бот: отвечает по шаблонам и данным склада.
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-slate-900 text-white shadow-lg px-4 py-3 text-sm font-medium hover:bg-slate-800"
        >
          Задать вопрос
        </button>
      )}
    </div>
  );
}

