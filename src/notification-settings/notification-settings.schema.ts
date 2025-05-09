import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationSettingsDocument = NotificationSettings & Document;

@Schema({ timestamps: true })
export class NotificationSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  allowAll: boolean;

  @Prop({ default: false })
  pushNotification: boolean;

  @Prop({ default: false })
  inAppNotification: boolean;

  @Prop({ default: false })
  emailNotification: boolean;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
