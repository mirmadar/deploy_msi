import * as path from 'path';
// Локальный запуск: подгружаем корневой .env, затем MetalStroyInvest/.env (перезапись). В Docker переменные уже переданы, dotenv может быть не установлен — ловим ошибку.
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') });
  require('dotenv').config();
} catch {
  // В production-образе dotenv не ставится — переменные приходят из docker-compose
}

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

/** В production при старте проверяем обязательные переменные окружения. */
function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const required: string[] = [];
  const vars: Record<string, string | undefined> = {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  };

  for (const [name, value] of Object.entries(vars)) {
    if (value === undefined || String(value).trim() === '') {
      required.push(name);
    }
  }

  if (required.length > 0) {
    throw new Error(
      `[Production] Missing required environment variables: ${required.join(', ')}. ` +
        'Set them in .env or your hosting config.',
    );
  }
}

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3002',
  'http://localhost:3001',
  'http://localhost:3000',
];

function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || !raw.trim()) return DEFAULT_CORS_ORIGINS;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  validateProductionEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  const allowedOrigins = getCorsOrigins();
  // Если фронт ходит на API с того же домена (через nginx по /api), CORS вообще не нужен.
  // Включаем его только когда явно задан список разрешённых origin’ов.
  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: (origin, callback) => {
        // Запросы без Origin (curl, сервер-сервер) не блокируем.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin not allowed: ${origin}`), false);
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',
        'Range',
        'X-Total-Count',
      ],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  }

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

/*При переходе в облако нужно будет заменить diskStorage на загрузку в S3/другое хранилище (или вынести это в отдельный сервис);
формировать imageUrl как полный URL облака (или базовый URL + путь в бакете). */