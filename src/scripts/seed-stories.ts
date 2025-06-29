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
    const filePath = path.resolve(__dirname, 'sample-stories.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const stories = JSON.parse(data);

    for (const story of stories) {
      const exists = await this.storyModel.findOne({ title: story.title }).exec();
      if (!exists) {
        await this.storyModel.create(story);
      }
    }
  }
}
