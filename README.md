# Birthday Billiards Tournament

Стартовый проект для приложения турнира по бильярду на день рождения.

## Стек

- React + TypeScript + Vite
- TailwindCSS
- TanStack React Query
- React Hook Form + Zod
- Framer Motion
- Supabase
- ESLint + Prettier

## Структура проекта

Проект организован по feature-based подходу:

```text
src/
  app/        # инициализация приложения, глобальные стили, провайдеры
  pages/      # страницы приложения
  widgets/    # крупные UI-блоки страниц
  features/   # пользовательские сценарии и формы
  entities/   # доменные типы и модели
  shared/     # общие API-клиенты, конфигурация и UI
```

## Переменные окружения

Скопируйте пример окружения и заполните значения Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Установка и запуск

```bash
npm install
npm run dev
```

Приложение будет доступно по адресу, который выведет Vite (обычно `http://localhost:5173`).

## Проверки

```bash
npm run lint
npm run format:check
npm run build
```
