import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getCommentsByStoryId(storyId: string): Promise<Comment[]> {
    if (!Types.ObjectId.isValid(storyId)) {
      throw new NotFoundException('Invalid story ID');
    }
    return this.commentModel.find({ storyId }).sort({ createdAt: -1 }).exec();
  }

  async addComment(storyId: string, userId: string, content: string): Promise<Comment> {
    if (!Types.ObjectId.isValid(storyId)) {
      throw new NotFoundException('Invalid story ID');
    }
    const newComment = new this.commentModel({
      storyId,
      userId,
      content,
    });
    return newComment.save();
  }
}
