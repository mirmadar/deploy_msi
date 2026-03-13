#!/bin/sh
set -e
# Синхронизируем схему БД с БД при старте (для первого деплоя и обновлений)
npx prisma db push --skip-generate
exec node dist/src/main.js
