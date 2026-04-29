const KEY = 'demo_client_id';

export function getDemoClientId() {
  if (typeof window === 'undefined') return 'server';
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `demo_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(KEY, id);
  return id;
}

