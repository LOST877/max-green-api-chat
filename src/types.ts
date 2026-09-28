export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  text: string;
  outgoing: boolean;
  timestamp: number; // ms
  status?: MessageStatus;
}

export interface Chat {
  chatId: string;
  name: string;
  phone?: string;
  unread: number;
}
