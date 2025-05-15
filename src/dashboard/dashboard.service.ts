import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../stories/story.schema';
import { LibraryService } from '../library/library.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private readonly libraryService: LibraryService,
  ) { }

  async getStoriesByDashboardCategory(category: string): Promise<Story[]> {
    return this.storyModel.find({ dashboardCategory: category }).exec();
  }

  async getAllStoriesGroupedByCategory(): Promise<Record<string, Story[]>> {
    const stories = await this.storyModel.find().exec();

    // Group stories by dashboardCategory
    const grouped: Record<string, Story[]> = {};
    stories.forEach(story => {
      const category = story.dashboardCategory || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(story);
    });

    // Randomize order within each category
    for (const category in grouped) {
      grouped[category] = grouped[category].sort(() => Math.random() - 0.5);
    }

    return grouped;
  }

  async getStoriesByStatus(status: string): Promise<Story[]> {
    return this.libraryService.getStoriesByStatus(status);
  }

  async getAllStoriesFromLibrary(): Promise<Story[]> {
    return this.libraryService.getAllStories();
  }
}
