import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) { }

  async findAll(userId: string): Promise<Conversation[]> {
    return this.conversationModel.find({ participants: userId })
      .populate({
        path: 'participants',
        select: '-password',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'username', populate: { path: 'person', select: 'firstName lastName profilePicture' } },
      })
      .exec();
  }

  async search(query: string, userId: string): Promise<Conversation[]> {
    // Find messages matching query
    const messages = await this.messageModel.find({
      content: { $regex: query, $options: 'i' },
    }).exec();

    const conversationIds = [...new Set(messages.map(msg => msg.conversation.toString()))];

    return this.conversationModel.find({ _id: { $in: conversationIds }, participants: userId })
      .populate({
        path: 'participants',
        select: '-password',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'messages',
        match: { content: { $regex: query, $options: 'i' } },
        populate: { path: 'sender', select: 'username', populate: { path: 'person', select: 'firstName lastName profilePicture' } },
      })
      .exec();
  }

  async sendMessage(conversationId: string, content: string, senderId: string, files: string[] = []): Promise<Message> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message: import('mongoose').Document & Message = new this.messageModel({
      conversation: conversation._id,
      sender: new Types.ObjectId(senderId),
      content,
      files,
    });

    await message.save();

    conversation.messages.push(message._id as Types.ObjectId);
    await conversation.save();

    return await message.populate({
      path: 'sender',
      select: 'username',
      populate: { path: 'person', select: 'firstName lastName profilePicture' },
    });
  }

  async createConversation(userId: string): Promise<Conversation> {
    const conversation = new this.conversationModel({
      participants: [new Types.ObjectId(userId)],
      messages: [],
    });
    await conversation.save();
    await conversation.populate('participants', '-password');
    return conversation;
  }

}
