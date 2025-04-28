import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type CreatorDocument = Creator & Document & {
  user: User & Document;
};

@Schema()
export class Creator {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop()
  username?: string;

  @Prop()
  bio?: string;

  @Prop()
  idUploadUrl?: string;

  @Prop()
  profession?: string;

  @Prop()
  location?: string;

  @Prop({ type: [String] })
  interests?: string[];

  @Prop()
  instagram?: string;

  @Prop()
  facebook?: string;

  @Prop()
  linkedin?: string;
  _id: any;
  profile: any;
  email: any;
  person: any;
}

export const CreatorSchema = SchemaFactory.createForClass(Creator); 