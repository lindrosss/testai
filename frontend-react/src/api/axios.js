import axios from 'axios';

/**
 * База API.
 * - localhost/127.0.0.1 в VITE_API_URL → относительный /api (Docker/Vite).
 * - абсолютный URL с другим хостом, чем у страницы (часто сборка с IP, сайт открыт с домена) → /api,
 *   иначе кросс-домен: куки Sanctum/CSRF не работают.
 */
function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL || '/api';
  if (typeof window !== 'undefined' && /^https?:\/\//i.test(env)) {
    try {
      const u = new URL(env);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return '/api';
      }
      if (u.hostname !== window.location.hostname) {
        return '/api';
      }
    } catch {
      /* ignore */
    }
  }
  return env;
}

const baseURL = resolveApiBase();

function csrfBaseUrl() {
  const api = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && api && /^https?:\/\//i.test(api)) {
    try {
      const u = new URL(api);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return '';
      }
      if (u.hostname !== window.location.hostname) {
        return '';
      }
    } catch {
      /* ignore */
    }
  }
  if (api && /^https?:\/\//i.test(api)) {
    return api.replace(/\/api\/?$/, '') || '';
  }
  return '';
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const TOKEN_KEY = 'token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

let csrfPromise = null;
export async function ensureCsrfCookie() {
  if (!csrfPromise) {
    const base = csrfBaseUrl();
    const csrfUrl = base
      ? `${base.replace(/\/$/, '')}/sanctum/csrf-cookie`
      : '/sanctum/csrf-cookie';
    csrfPromise = axios.get(csrfUrl, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

api.interceptors.request.use(async (config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    await ensureCsrfCookie();
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!getStoredToken();
      setStoredToken(null);
      if (
        hadToken &&
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY };
