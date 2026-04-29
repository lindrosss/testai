import { api } from './axios';

/** For useSWR: GET relative to API base. */
export const fetcher = (path) => api.get(path).then((r) => r.data);
