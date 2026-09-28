import type { Message } from '../types';

const STATUS_ICON: Record<string, string> = { sending: '🕓', sent: '✓', failed: '⚠' };

export default function MessageBubble({ message }: { message: Message }) {
  const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`bubble ${message.outgoing ? 'bubble--out' : 'bubble--in'}`}>
      <div className="bubble__text">{message.text}</div>
      <div className="bubble__meta">
        {time}
        {message.outgoing && message.status && (
          <span className={`bubble__status bubble__status--${message.status}`}>
            {' '}
            {STATUS_ICON[message.status]}
          </span>
        )}
      </div>
      {message.status === 'failed' && <div className="bubble__failed">Не отправлено</div>}
    </div>
  );
}
