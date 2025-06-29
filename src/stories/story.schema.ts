import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop()
  mainCharacter?: string;

  @Prop()
  audience?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  language?: string;

  @Prop()
  fileUrl?: string;

  @Prop({ default: false })
  fullAccess: boolean;

  @Prop()
  content?: string;

  @Prop()
  author?: string;

  @Prop()
  chapterTitle?: string;

  @Prop()
  subtitle?: string;

  @Prop({ default: 'keep-reading' })
  status: string;

  @Prop()
  dashboardCategory?: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  votes: number;
}

export const StorySchema = SchemaFactory.createForClass(Story);
