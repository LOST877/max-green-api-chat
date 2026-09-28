import { useState, type FormEvent } from 'react';
import { getStateInstance } from '../api/greenApi';
import type { Credentials } from '../types';

const DEFAULT_API_URL = 'https://api.green-api.com';

export default function LoginForm({ onLogin }: { onLogin: (c: Credentials) => void }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const credentials: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
    };
    setError(null);
    setLoading(true);
    try {
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (состояние: ${stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`);
        return;
      }
      onLogin(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось подключиться');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__logo">MAX</div>
        <h1>Вход в чат</h1>
        <p className="login__hint">Введите данные инстанса из личного кабинета GREEN-API</p>

        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="3100000000"
            inputMode="numeric"
            required
            autoFocus
          />
        </label>
        <label>
          apiTokenInstance
          <input
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            type="password"
            placeholder="••••••••••••"
            required
          />
        </label>
        <label>
          apiUrl
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder={DEFAULT_API_URL} />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
