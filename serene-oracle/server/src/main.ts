import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Включаем CORS, чтобы твой Vercel фронтенд мог достучаться до этого бэкенда
  app.enableCors();

  // 2. Настройка Swagger — именно здесь магия для /api-docs
  const config = new DocumentBuilder()
    .setTitle('Daily Companion API')
    .setDescription('Документация бэкенда для мобильного приложения')
    .setVersion('1.0')
    .addBearerAuth() // Добавляет кнопку авторизации для токена
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Устанавливаем путь /api-docs
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Чтобы токен не слетал при обновлении страницы
    },
  });

  // 3. Порт — Render сам выдает PORT, поэтому используем process.env.PORT
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  logger.log(`🚀 Сервер запущен на: https://daily-companion-mvp.onrender.com`);
  logger.log(`📖 Документация Swagger: https://daily-companion-mvp.onrender.com/api-docs`);
}
bootstrap();
