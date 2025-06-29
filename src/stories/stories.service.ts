import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from './story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { MediaService } from '../media/media.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StoriesService {
  private sampleStories: Story[] = [];

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private readonly mediaService: MediaService,
  ) {
    this.loadSampleStories();
  }

  private loadSampleStories() {
    const filePath = path.resolve(process.cwd(), 'src/scripts/sample-stories.json');
    console.log('Loading sample stories from:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('Sample stories file does not exist:', filePath);
      this.sampleStories = [];
      return;
    }
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      this.sampleStories = JSON.parse(data);
      console.log(`Loaded ${this.sampleStories.length} sample stories`);
    } catch (error) {
      console.error('Failed to load sample stories:', error);
      this.sampleStories = [];
    }
  }

  async createStory(createStoryDto: CreateStoryDto, file?: Express.Multer.File): Promise<Story> {
    try {
      let fileUrl: string | undefined = undefined;

      if (file) {
        const uploadResult = await this.mediaService.addMedia(file);
        if (!uploadResult || !uploadResult.url) {
          throw new InternalServerErrorException('Failed to upload file');
        }
        fileUrl = uploadResult.url!;
      }

      const createdStory = new this.storyModel({
        ...createStoryDto,
        tags: createStoryDto.tags || [],
        fileUrl,
        views: 0,
        votes: 0,
      });

      return await createdStory.save();
    } catch (error) {
      console.error('Error creating story:', error);
      throw new InternalServerErrorException(error.message || 'Error creating story');
    }
  }

  async getStoryById(storyId: string): Promise<Story | null> {
    // Check sample stories first
    const sampleStory = this.sampleStories.find(story => (story as any)._id === storyId);
    if (sampleStory) {
      return sampleStory as Story;
    }
    // Otherwise fetch from DB
    return this.storyModel.findById(storyId).exec();
  }

  async getStoriesByCategory(category: string): Promise<any[]> {

    if (category === 'readers-favourite') {
      // Top viewed stories
      const dbStories = await this.storyModel.find().sort({ views: -1 }).limit(10).exec();
      const sampleStories = this.sampleStories.filter(story => story.category === category);

      const mappedDbStories = dbStories.map(story => ({
        id: (story._id as any).toString(),
        ...story.toObject(),
      }));

      const mappedSampleStories = sampleStories.map((story) => ({
        id: (story as any)._id.toString(),
        ...story,
      }));

      return [...mappedSampleStories, ...mappedDbStories];
    }

    if (category === 'highly-rated') {
      // Top voted stories
      const dbStories = await this.storyModel.find().sort({ votes: -1 }).limit(10).exec();
      const sampleStories = this.sampleStories.filter(story => story.category === category);

      const mappedDbStories = dbStories.map(story => ({
        id: (story._id as any).toString(),
        ...story.toObject(),
      }));

      const mappedSampleStories = sampleStories.map((story) => ({
        id: (story as any)._id.toString(),
        ...story,
      }));

      return [...mappedSampleStories, ...mappedDbStories];
    }

    // Other categories
    const dbStories = await this.storyModel.find({ category }).exec();
    const sampleStories = this.sampleStories.filter(story => story.category === category);

    const mappedDbStories = dbStories.map(story => ({
      id: (story._id as any).toString(),
      ...story.toObject(),
    }));

    const mappedSampleStories = sampleStories.map((story) => ({
      id: (story as any)._id.toString(),
      ...story,
    }));

    return [...mappedSampleStories, ...mappedDbStories];
  }

  async getStoriesByCategories(categories: string[]): Promise<Story[]> {
    const dbStories = await this.storyModel.find({ category: { $in: categories } }).exec();
    const sampleStories = this.sampleStories.filter(story => story.category !== undefined && categories.includes(story.category));
    return [...sampleStories, ...dbStories];
  }
}
