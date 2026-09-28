import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification, type Notification } from '../api/greenApi';
import type { Credentials, Message } from '../types';

const RECEIVE_TIMEOUT = 20;
const RETRY_DELAY = 5000;

export interface IncomingEvent {
  message: Message;
  senderName?: string;
}

/** Extracts a text message from a notification, or null if it is not one. */
function toEvent(n: Notification): IncomingEvent | null {
  const { body } = n;
  const outgoing =
    body.typeWebhook === 'outgoingMessageReceived' || body.typeWebhook === 'outgoingAPIMessageReceived';
  if (body.typeWebhook !== 'incomingMessageReceived' && !outgoing) return null;

  const data = body.messageData;
  const text =
    data?.typeMessage === 'textMessage'
      ? data.textMessageData?.textMessage
      : data?.typeMessage === 'extendedTextMessage'
        ? data.extendedTextMessageData?.text
        : undefined;
  if (!text || !body.senderData || !body.idMessage) return null;

  return {
    message: {
      id: body.idMessage,
      chatId: body.senderData.chatId,
      text,
      outgoing,
      timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
      status: outgoing ? 'sent' : undefined,
    },
    senderName: outgoing ? undefined : body.senderData.senderName || body.senderData.chatName,
  };
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });

/**
 * Polls the GREEN-API notification queue (HTTP API technology):
 * receiveNotification → handle → deleteNotification, in a loop.
 */
export function useNotifications(
  credentials: Credentials,
  onEvent: (e: IncomingEvent) => void,
  onError: (message: string | null) => void,
) {
  const onEventRef = useRef(onEvent);
  const onErrorRef = useRef(onError);
  onEventRef.current = onEvent;
  onErrorRef.current = onError;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT, signal);
          onErrorRef.current(null);
          if (!notification) continue;

          const event = toEvent(notification);
          if (event) onEventRef.current(event);
          // Delete every notification (including statuses) so the queue never gets stuck.
          await deleteNotification(credentials, notification.receiptId, signal);
        } catch (err) {
          if (signal.aborted) return;
          onErrorRef.current(err instanceof Error ? err.message : 'Ошибка получения сообщений');
          await sleep(RETRY_DELAY, signal);
        }
      }
    })();

    return () => controller.abort();
  }, [credentials]);
}
