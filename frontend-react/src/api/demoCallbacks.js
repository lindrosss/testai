import { api } from './axios';
import { getDemoClientId } from './demoClient';

function demoHeaders() {
  return { 'X-Demo-Client': getDemoClientId() };
}

export async function fetchCallbackSummary() {
  const { data } = await api.get('/demo/callback-requests/summary', { headers: demoHeaders() });
  return data;
}

export async function fetchCallbackRequests(params) {
  const { data } = await api.get('/demo/callback-requests', { params, headers: demoHeaders() });
  return data;
}

export async function updateCallbackStatus(id, status) {
  const { data } = await api.patch(`/demo/callback-requests/${id}/status`, { status }, { headers: demoHeaders() });
  return data;
}

export async function updateCallbackMessage(id, message) {
  const { data } = await api.patch(`/demo/callback-requests/${id}/message`, { message }, { headers: demoHeaders() });
  return data;
}

export async function createCallbackFromCalculator(phone) {
  const { data } = await api.post(
    '/demo/callback-requests/from-calculator',
    { phone },
    { headers: demoHeaders() },
  );
  return data;
}

