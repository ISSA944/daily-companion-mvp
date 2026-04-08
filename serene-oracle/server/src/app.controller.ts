import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Daily Companion API') // Название группы роутов в Сваггере
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Получить Daily Pack для главного экрана' })
  @ApiResponse({ status: 200, description: 'Успешно возвращает гороскоп, праздник и поддержку' })
  @Get('home')
  getHome() { return this.appService.getHomePack(); }

  @ApiOperation({ summary: 'Изменить настроение пользователя' })
  @ApiBody({ schema: { example: { mood: 'anxious' } } })
  @ApiResponse({ status: 201, description: 'Настроение обновлено' })
  @Post('mood')
  updateMood(@Body('mood') mood: string) { return this.appService.updateUserMood(mood); }

  @ApiOperation({ summary: 'Получить следующую фразу поддержки' })
  @ApiQuery({ name: 'mood', required: true, example: 'calm', description: 'Текущее настроение пользователя' })
  @ApiResponse({ status: 200, description: 'Возвращает новую фразу под выбранное настроение' })
  @Get('phrase')
  getNextPhrase(@Query('mood') mood: string) { return this.appService.getNextPhrase(mood); }

  @ApiOperation({ summary: 'Сохранить закладку (гороскоп или фразу)' })
  @ApiBody({ schema: { example: { type: 'support', content: 'Всё будет хорошо' } } })
  @ApiResponse({ status: 201, description: 'Контент успешно сохранен в закладки' })
  @Post('bookmarks')
  saveBookmark(@Body() body: { type: string, content: any }) {
    return this.appService.saveBookmark(body.type, body.content);
  }

  @ApiOperation({ summary: 'Получить все закладки пользователя' })
  @ApiResponse({ status: 200, description: 'Список сохраненных закладок' })
  @Get('bookmarks')
  getBookmarks() { return this.appService.getBookmarks(); }

  @ApiOperation({ summary: 'Получить уведомления' })
  @ApiResponse({ status: 200, description: 'Список уведомлений для пользователя' })
  @Get('notifications')
  getNotifications() { return this.appService.getNotifications(); }
}