Для запуска приложения требуется
NodeJS v19.7.0
Docker version 23.0.1
Свободные порты 3999(Приложение), 3998(БД)

1. Запуск контейнера с БД Postgres:</br>
npm run start-pg-container
2. Для загрузки дампа БД:</br>
npm run dump-db
3. Установка зависимостей:</br>
npm i
4. Запуск приложения:</br>
npm run start
5. Для запуска тестов:</br>
npm run test

Swagger доступен по http://localhost:3999/api-docs/
