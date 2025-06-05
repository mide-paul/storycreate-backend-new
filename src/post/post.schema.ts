import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type PostDocument = Post & Document;

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: SchemaTypes.Mixed }], default: [] })
  replies: any[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);


@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ type: Types.ObjectId, ref: 'Community', required: false })
  communityId?: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
