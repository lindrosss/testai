import { api } from './axios';

export async function sendBotMessage(payload) {
  const { data } = await api.post('/demo/bot/message', payload);
  return data;
}

