import { useState, type FormEvent } from 'react';
import type { Chat, Message } from '../types';
import Avatar from './Avatar';

interface Props {
  chats: Chat[];
  messages: Message[];
  activeChatId: string | null;
  idInstance: string;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => Promise<string | null>;
  onLogout: () => void;
}

export default function Sidebar({ chats, messages, activeChatId, idInstance, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const err = await onCreate(phone);
    setLoading(false);
    setError(err);
    if (!err) setPhone('');
  }

  const lastMessage = (chatId: string) => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].chatId === chatId) return messages[i];
    return undefined;
  };

  return (
    <aside className={`sidebar${activeChatId ? ' sidebar--hidden-mobile' : ''}`}>
      <header className="sidebar__header">
        <h2>Чаты</h2>
        <button className="link-btn" onClick={onLogout} title={`Инстанс ${idInstance}`}>
          Выйти
        </button>
      </header>

      <form className="new-chat" onSubmit={handleCreate}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона, +7…"
          inputMode="tel"
        />
        <button className="btn btn--small" type="submit" disabled={loading || !phone.trim()}>
          {loading ? '…' : 'Создать'}
        </button>
      </form>
      {error && <div className="error error--sidebar">{error}</div>}

      <ul className="chat-list">
        {chats.length === 0 && <li className="chat-list__empty">Введите номер, чтобы начать новый чат</li>}
        {chats.map((chat) => {
          const last = lastMessage(chat.chatId);
          return (
            <li key={chat.chatId}>
              <button
                className={`chat-item${chat.chatId === activeChatId ? ' chat-item--active' : ''}`}
                onClick={() => onSelect(chat.chatId)}
              >
                <Avatar name={chat.name} />
                <div className="chat-item__body">
                  <div className="chat-item__top">
                    <span className="chat-item__name">{chat.name}</span>
                    {last && (
                      <span className="chat-item__time">
                        {new Date(last.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="chat-item__bottom">
                    <span className="chat-item__preview">
                      {last ? (last.outgoing ? 'Вы: ' : '') + last.text : 'Нет сообщений'}
                    </span>
                    {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
