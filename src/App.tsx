import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Messenger from './components/Messenger';
import { clearCredentials, loadCredentials, saveCredentials } from './storage';
import type { Credentials } from './types';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials);

  if (!credentials) {
    return (
      <LoginForm
        onLogin={(c) => {
          saveCredentials(c);
          setCredentials(c);
        }}
      />
    );
  }

  return (
    <Messenger
      key={credentials.idInstance}
      credentials={credentials}
      onLogout={() => {
        clearCredentials();
        setCredentials(null);
      }}
    />
  );
}
