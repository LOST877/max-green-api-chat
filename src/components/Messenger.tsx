import { useCallback, useEffect, useRef, useState } from 'react';
import { checkAccount, sendMessage } from '../api/greenApi';
import { useNotifications, type IncomingEvent } from '../hooks/useNotifications';
import { loadChats, loadMessages, saveChats, saveMessages } from '../storage';
import type { Chat, Credentials, Message } from '../types';
import ChatWindow from './ChatWindow';
import Sidebar from './Sidebar';

interface Props {
  credentials: Credentials;
  onLogout: () => void;
}

let localIdCounter = 0;

function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (digits.length === 10) digits = '7' + digits;
  return digits;
}

export default function Messenger({ credentials, onLogout }: Props) {
  const { idInstance } = credentials;
  const [chats, setChats] = useState<Chat[]>(() => loadChats(idInstance));
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(idInstance));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => saveChats(idInstance, chats), [idInstance, chats]);
  useEffect(() => saveMessages(idInstance, messages), [idInstance, messages]);

  const handleEvent = useCallback(
    ({ message, senderName }: IncomingEvent) => {
      if (messagesRef.current.some((m) => m.id === message.id)) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setChats((prev) => {
        const existing = prev.find((c) => c.chatId === message.chatId);
        const isActive = message.chatId === activeChatId;
        if (!existing) {
          const chat: Chat = {
            chatId: message.chatId,
            name: senderName || message.chatId,
            unread: message.outgoing || isActive ? 0 : 1,
          };
          return [chat, ...prev];
        }
        const updated: Chat = {
          ...existing,
          name: senderName || existing.name,
          unread: message.outgoing || isActive ? existing.unread : existing.unread + 1,
        };
        return [updated, ...prev.filter((c) => c !== existing)];
      });
    },
    [activeChatId],
  );

  useNotifications(credentials, handleEvent, setPollError);

  async function createChat(phoneInput: string): Promise<string | null> {
    const phone = normalizePhone(phoneInput);
    if (phone.length < 11 || phone.length > 12) return 'Введите номер в формате +7XXXXXXXXXX';
    try {
      const { exist, chatId } = await checkAccount(credentials, Number(phone));
      if (!exist || !chatId) return 'Номер не зарегистрирован в MAX';
      setChats((prev) => {
        const existing = prev.find((c) => c.chatId === chatId);
        const chat: Chat = existing ? { ...existing, phone } : { chatId, phone, name: `+${phone}`, unread: 0 };
        return [chat, ...prev.filter((c) => c.chatId !== chatId)];
      });
      openChat(chatId);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Не удалось создать чат';
    }
  }

  function openChat(chatId: string) {
    setActiveChatId(chatId);
    setChats((prev) => prev.map((c) => (c.chatId === chatId && c.unread ? { ...c, unread: 0 } : c)));
  }

  async function send(text: string) {
    if (!activeChatId) return;
    const chatId = activeChatId;
    const tempId = `local-${Date.now()}-${++localIdCounter}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, chatId, text, outgoing: true, timestamp: Date.now(), status: 'sending' },
    ]);
    setChats((prev) => {
      const chat = prev.find((c) => c.chatId === chatId);
      return chat && prev[0] !== chat ? [chat, ...prev.filter((c) => c !== chat)] : prev;
    });
    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      setMessages((prev) => {
        const withoutDup = prev.filter((m) => m.id !== idMessage);
        return withoutDup.map((m) => (m.id === tempId ? { ...m, id: idMessage, status: 'sent' } : m));
      });
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)));
    }
  }

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null;

  return (
    <div className="messenger">
      <Sidebar
        chats={chats}
        messages={messages}
        activeChatId={activeChatId}
        idInstance={idInstance}
        onSelect={openChat}
        onCreate={createChat}
        onLogout={onLogout}
      />
      <ChatWindow
        chat={activeChat}
        messages={messages.filter((m) => m.chatId === activeChatId)}
        error={pollError}
        onSend={send}
        onBack={() => setActiveChatId(null)}
      />
    </div>
  );
}
