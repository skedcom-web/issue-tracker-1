import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { TraceMiddleware } from '@common/middleware/trace.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── CORS ────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'traceparent'],
    exposedHeaders: ['traceparent'],
  });

  // ── Global Validation ────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Exception Filter ──────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── W3C Trace Middleware ─────────────────────────────────────────
  app.use(new TraceMiddleware().use.bind(new TraceMiddleware()));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 vThink Tracker API running on http://localhost:${port}/api/v1`);
}

bootstrap();
