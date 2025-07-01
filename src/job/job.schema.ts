import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export type JobDocument = Job & Document;

@Schema({ timestamps: { createdAt: 'postedAt', updatedAt: false } })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: User | Types.ObjectId;

  @Prop()
  postedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
