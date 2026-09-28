import type { Chat, Credentials, Message } from './types';

const KEY_CREDENTIALS = 'maxchat.credentials';
const keyChats = (id: string) => `maxchat.${id}.chats`;
const keyMessages = (id: string) => `maxchat.${id}.messages`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep working in memory */
  }
}

export const loadCredentials = () => read<Credentials | null>(KEY_CREDENTIALS, null);
export const saveCredentials = (c: Credentials) => write(KEY_CREDENTIALS, c);
export const clearCredentials = () => localStorage.removeItem(KEY_CREDENTIALS);

export const loadChats = (idInstance: string) => read<Chat[]>(keyChats(idInstance), []);
export const saveChats = (idInstance: string, chats: Chat[]) => write(keyChats(idInstance), chats);

export const loadMessages = (idInstance: string) => read<Message[]>(keyMessages(idInstance), []);
export const saveMessages = (idInstance: string, messages: Message[]) =>
  write(keyMessages(idInstance), messages);
