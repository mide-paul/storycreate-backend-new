import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export type CommunityDocument = Community & Document;

@Schema({ timestamps: true })
export class Community {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  membersCount: number;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
