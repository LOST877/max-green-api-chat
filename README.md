# MAX Chat — GREEN-API

Простой веб-чат на React для отправки и получения текстовых сообщений в мессенджере MAX через [GREEN-API](https://green-api.com/max). Внешний вид — по мотивам web.max.ru.

**Демо:** https://lost877.github.io/max-green-api-chat/

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production-сборка в dist/
```

## Использование

1. В [личном кабинете GREEN-API](https://console.green-api.com) создайте инстанс MAX и авторизуйте его.
2. Откройте сайт и введите `idInstance`, `apiTokenInstance` и `apiUrl` (всё есть в кабинете; по умолчанию `https://api.green-api.com`).
3. Введите номер телефона получателя (+7… / +375…) и нажмите «Создать».
4. Напишите сообщение и отправьте (Enter; Shift+Enter — перенос строки).
5. Ответ получателя из MAX появится в чате в течение нескольких секунд.

> Для получения сообщений в настройках инстанса должен быть **пустой** `webhookUrl` и включены входящие уведомления (`incomingWebhook`). Одновременно опрашивать очередь должен только один клиент — иначе уведомления «разберёт» другой.

## Как это устроено

| Действие | Метод GREEN-API |
|---|---|
| Проверка учётных данных | `getStateInstance` (инстанс должен быть `authorized`) |
| Создание чата | `checkAccount` — по номеру получаем MAX `chatId`, с которым приходят входящие |
| Отправка | [`sendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/) |
| Получение | [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): цикл `receiveNotification` (long polling, 20 с) → `deleteNotification` |

- Обрабатываются только текстовые сообщения (`incomingMessageReceived` и `outgoingMessageReceived`/`outgoingAPIMessageReceived`); остальные уведомления просто удаляются из очереди.
- Бэкенда нет: браузер обращается к GREEN-API напрямую (API отдаёт CORS-заголовки).
- Учётные данные, чаты и история хранятся в `localStorage` браузера.

## Структура

```
src/
  api/greenApi.ts            — клиент GREEN-API
  hooks/useNotifications.ts  — цикл получения уведомлений
  components/                — LoginForm, Messenger, Sidebar, ChatWindow, MessageBubble, Avatar
  storage.ts, types.ts, styles.css
```
