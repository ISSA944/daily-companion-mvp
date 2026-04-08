import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <-- Добавили импорт

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Твой рабочий CORS для связи с Vercel
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- МАГИЯ SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Daily Companion API')
    .setDescription('Документация API для приложения Daily Companion')
    .setVersion('1.0')
    .addTag('Endpoints') // Тэг для группировки
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  // Сваггер будет доступен по ссылке /api/docs
  SwaggerModule.setup('api/docs', app, document); 
  // ----------------------

  await app.listen(process.env.PORT || 3000);
}
bootstrap();