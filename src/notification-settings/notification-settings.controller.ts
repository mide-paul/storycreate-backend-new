import { Controller, Get, Put, Param, Body, Query } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';

@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Get()
  async getSettings(@Query('userId') userId: string) {
    return this.notificationSettingsService.getSettingsByUser(userId);
  }

  @Put(':id')
  async updateSettings(@Param('id') id: string, @Body() updateData: any) {
    return this.notificationSettingsService.updateSettings(id, updateData);
  }
}
