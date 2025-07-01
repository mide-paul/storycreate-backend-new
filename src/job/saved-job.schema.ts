import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Job } from './job.schema';

export type SavedJobDocument = SavedJob & Document;

@Schema()
export class SavedJob {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Job | Types.ObjectId;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);
