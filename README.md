# Life Tracker

Life Tracker - это веб-приложение для отслеживания задач и активности, построенное с использованием современного стека технологий.

## Технологии

### Frontend

- React 19
- TypeScript
- Vite
- CSS Modules

### Backend

- Node.js
- Express
- MySQL
- TypeScript

## Требования

- Node.js (рекомендуется версия 18+)
- MySQL
- npm или yarn

## Установка

1. Клонируйте репозиторий:

```bash
git clone [URL репозитория]
cd life-tracker
```

2. Установите зависимости:

```bash
# Установка корневых зависимостей
npm install

# Установка зависимостей клиента
cd client
npm install

# Установка зависимостей сервера
cd ../server
npm install
```

3. Настройка базы данных:

- Создайте базу данных MySQL
- Импортируйте структуру из файла `life_tracker_structure.sql`

## Запуск

### Разработка

Для запуска в режиме разработки выполните в корневой директории:

```bash
npm start
```

Это запустит:

- Сервер разработки на http://localhost:3000
- Клиентское приложение на http://localhost:5173

### Продакшн

1. Сборка клиента:

```bash
cd client
npm run build
```

2. Сборка сервера:

```bash
cd server
npm run build
```

3. Запуск сервера:

```bash
npm run prod
```

## Структура проекта

```
life-tracker/
├── client/                 # React приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── views/         # Страницы приложения
│   │   ├── api.ts         # API клиент
│   │   └── App.tsx        # Корневой компонент
│   └── vite.config.ts     # Конфигурация Vite
├── server/                 # Node.js сервер
│   ├── api/               # API роуты
│   ├── dist/              # Скомпилированный код
│   └── index.ts           # Точка входа сервера
└── life_tracker_structure.sql  # Структура базы данных
```

## Лицензия

ISC

