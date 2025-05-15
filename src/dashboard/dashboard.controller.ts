import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('trending')
  async getTrending() {
    return this.dashboardService.getStoriesByDashboardCategory('trending');
  }

  @Get('sponsored-posts')
  async getSponsoredPosts() {
    return this.dashboardService.getStoriesByDashboardCategory('sponsored-posts');
  }

  @Get('readers-favourite')
  async getReadersFavourite() {
    return this.dashboardService.getStoriesByDashboardCategory('readers-favourite');
  }

  @Get('highly-rated')
  async getHighlyRated() {
    return this.dashboardService.getStoriesByDashboardCategory('highly-rated');
  }

  @Get('exciting-genre')
  async getExcitingGenre() {
    return this.dashboardService.getStoriesByDashboardCategory('exciting-genre');
  }

  @Get('audio-books')
  async getAudioBooks() {
    return this.dashboardService.getStoriesByDashboardCategory('audio-books');
  }

  @Get('anime-stories')
  async getAnimeStories() {
    return this.dashboardService.getStoriesByDashboardCategory('anime-stories');
  }

  @Get('graphic-novels')
  async getGraphicNovels() {
    return this.dashboardService.getStoriesByDashboardCategory('graphic-novels');
  }

  @Get('all-stories')
  async getAllStoriesGroupedByCategory() {
    return this.dashboardService.getAllStoriesGroupedByCategory();
  }

  @Get('stories-by-status')
  async getStoriesByStatus(@Query('status') status: string) {
    return this.dashboardService.getStoriesByStatus(status);
  }

  @Get('all-library-stories')
  async getAllLibraryStories() {
    return this.dashboardService.getAllStoriesFromLibrary();
  }
}
