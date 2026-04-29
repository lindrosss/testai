import { api } from './axios';
import { getDemoClientId } from './demoClient';

function demoHeaders() {
  return { 'X-Demo-Client': getDemoClientId() };
}

export async function fetchAutoReference() {
  const { data } = await api.get('/demo/auto/reference', { headers: demoHeaders() });
  return data;
}

export async function calculateAutoCost(payload) {
  const { data } = await api.post('/demo/auto/calculate', payload, { headers: demoHeaders() });
  return data;
}

export async function fetchAutoHistory() {
  const { data } = await api.get('/demo/auto/history', { headers: demoHeaders() });
  return data;
}

export async function fetchStockCars(params) {
  const { data } = await api.get('/demo/stock-cars', { params });
  return data;
}

export async function createStockCar(payload) {
  const { data } = await api.post('/demo/stock-cars', payload);
  return data;
}

export async function updateStockCar(id, payload) {
  const { data } = await api.put(`/demo/stock-cars/${id}`, payload);
  return data;
}

export async function deleteStockCar(id) {
  const { data } = await api.delete(`/demo/stock-cars/${id}`);
  return data;
}

