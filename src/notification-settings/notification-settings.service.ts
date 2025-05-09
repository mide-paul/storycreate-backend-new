import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationSettings, NotificationSettingsDocument } from './notification-settings.schema';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectModel(NotificationSettings.name) private notificationSettingsModel: Model<NotificationSettingsDocument>,
  ) {}

  async getSettingsByUser(userId: string): Promise<NotificationSettings[]> {
    return this.notificationSettingsModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async updateSettings(id: string, updateData: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const updated = await this.notificationSettingsModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Notification settings not found');
    }
    return updated;
  }
}
