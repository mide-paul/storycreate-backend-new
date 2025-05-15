import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../stories/story.schema';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) {}

  async getStoriesByStatus(status: string): Promise<Story[]> {
    return this.storyModel.find({ status }).exec();
  }

  async getAllStories(): Promise<Story[]> {
    return this.storyModel.find().exec();
  }
}
