import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from './story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private readonly mediaService: MediaService,
  ) {}

  async createStory(createStoryDto: CreateStoryDto, file?: Express.Multer.File): Promise<Story> {
    try {
      let fileUrl: string | undefined = undefined;

      if (file) {
        const uploadResult = await this.mediaService.addMedia(file);
        if (!uploadResult || !uploadResult.url) {
          throw new InternalServerErrorException('Failed to upload file');
        }
        fileUrl = uploadResult.url;
      }

      const createdStory = new this.storyModel({
        ...createStoryDto,
        tags: createStoryDto.tags || [],
        fileUrl,
      });

      return await createdStory.save();
    } catch (error) {
      console.error('Error creating story:', error);
      throw new InternalServerErrorException(error.message || 'Error creating story');
    }
  }

  async getStoryById(storyId: string): Promise<Story | null> {
    return this.storyModel.findById(storyId).exec();
  }
}
