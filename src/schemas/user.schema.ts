import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Person } from './person.schema';
import { Role } from './role.schema';
import { AccessMethod } from '../core/enums';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  password?: string;

  @Prop({ enum: AccessMethod, default: AccessMethod.EMAIL_PASSWORD })
  accessMethod: AccessMethod;

  @Prop()
  uid?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles: Role[];

  @Prop({ type: Types.ObjectId, ref: 'Person' })
  person: Person;

  @Prop({ type: Types.ObjectId, ref: 'Creator' })
  creator?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'BankAccount' }] })
  bankAccounts: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Story' }], default: [] })
  savedBooks: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
