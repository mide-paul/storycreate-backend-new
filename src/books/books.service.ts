import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../stories/story.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) {}

  async rateStory(storyId: string, rating: number): Promise<StoryDocument> {
    const story = await this.storyModel.findById(storyId).exec();
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    const totalVotes = story.votes || 0;
    const currentRating = story.rating || 0;
    const newVotes = totalVotes + 1;
    const newRating = (currentRating * totalVotes + rating) / newVotes;

    story.rating = newRating;
    story.votes = newVotes;

    await story.save();
    return story;
  }

  async getStoryById(storyId: string): Promise<StoryDocument | null> {
    return this.storyModel.findById(storyId).exec();
  }
}
