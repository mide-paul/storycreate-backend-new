import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Gender } from '../core/enums';

export type PersonDocument = Person & Document & {
  _id: Types.ObjectId;
};

@Schema()
export class Person {
  _id: Types.ObjectId;

  @Prop()
  profilePicture?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  middleName?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ enum: Gender })
  gender?: string;

  @Prop()
  bio?: string;

  @Prop()
  profession?: string;

  @Prop()
  location?: string;

  @Prop()
  interests?: string[];

  @Prop()
  instagram?: string;

  @Prop()
  facebook?: string;

  @Prop()
  linkedin?: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person); 