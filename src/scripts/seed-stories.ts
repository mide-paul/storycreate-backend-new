import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../stories/story.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorySeeder {
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<StoryDocument>,
  ) {}

  async seed() {
    // Adjust path to work in both dev and production
    const basePath = process.env.NODE_ENV === 'production' ? path.resolve(process.cwd(), 'dist', 'scripts') : path.resolve(process.cwd(), 'src', 'scripts');
    const filePath = path.join(basePath, 'sample-stories.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const stories = JSON.parse(data);

    for (const story of stories) {
      const exists = await this.storyModel.findOne({ title: story.title }).exec();
      if (!exists) {
        // Remove _id to avoid duplicate key error
        const { _id, ...storyData } = story;
        await this.storyModel.create(storyData);
      }
    }
  }
}
