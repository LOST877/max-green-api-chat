import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Chat, Message } from '../types';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';

interface Props {
  chat: Chat | null;
  messages: Message[];
  error: string | null;
  onSend: (text: string) => void;
  onBack: () => void;
}

export default function ChatWindow({ chat, messages, error, onSend, onBack }: Props) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, chat?.chatId]);

  if (!chat) {
    return (
      <main className="chat chat--empty">
        <div className="chat__placeholder">Выберите чат или создайте новый по номеру телефона</div>
      </main>
    );
  }

  function submit() {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <main className="chat">
      <header className="chat__header">
        <button className="link-btn chat__back" onClick={onBack} aria-label="Назад">
          ←
        </button>
        <Avatar name={chat.name} />
        <div>
          <div className="chat__title">{chat.name}</div>
          <div className="chat__subtitle">{chat.phone ? `+${chat.phone}` : `ID ${chat.chatId}`}</div>
        </div>
      </header>

      {error && <div className="chat__banner">Нет связи с GREEN-API: {error}</div>}

      <div className="chat__messages">
        {messages.length === 0 && <div className="chat__placeholder">Сообщений пока нет. Напишите первым!</div>}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
          maxLength={4000}
          autoFocus
        />
        <button className="composer__send" onClick={submit} disabled={!text.trim()} aria-label="Отправить">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" />
          </svg>
        </button>
      </div>
    </main>
  );
}
