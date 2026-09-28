import type { Credentials } from '../types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function url(c: Credentials, method: string, suffix = '') {
  const base = c.apiUrl.replace(/\/+$/, '');
  return `${base}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}${suffix}`;
}

async function request<T>(
  c: Credentials,
  method: string,
  init: RequestInit & { suffix?: string } = {},
): Promise<T> {
  const { suffix, ...rest } = init;
  const res = await fetch(url(c, method, suffix), {
    ...rest,
    headers: rest.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      throw new ApiError('Неверный idInstance или apiTokenInstance', res.status);
    }
    throw new ApiError(`Ошибка GREEN-API ${res.status}${text ? `: ${text}` : ''}`, res.status);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function getStateInstance(c: Credentials) {
  return request<{ stateInstance: string }>(c, 'getStateInstance');
}

export function checkAccount(c: Credentials, phoneNumber: number) {
  return request<{ exist: boolean; chatId: string }>(c, 'checkAccount', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export function sendMessage(c: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(c, 'sendMessage', {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  });
}

export interface Notification {
  receiptId: number;
  body: {
    typeWebhook: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: { chatId: string; sender?: string; senderName?: string; chatName?: string };
    messageData?: {
      typeMessage: string;
      textMessageData?: { textMessage: string };
      extendedTextMessageData?: { text: string };
    };
  };
}

export function receiveNotification(c: Credentials, receiveTimeout: number, signal?: AbortSignal) {
  return request<Notification | null>(c, 'receiveNotification', {
    suffix: `?receiveTimeout=${receiveTimeout}`,
    signal,
  });
}

export function deleteNotification(c: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(c, 'deleteNotification', {
    method: 'DELETE',
    suffix: `/${receiptId}`,
    signal,
  });
}
