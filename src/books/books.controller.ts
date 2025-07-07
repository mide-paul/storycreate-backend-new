import { Controller, Post, Param, Body, BadRequestException, Get, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post(':bookId/rating')
  async rateBook(
    @Param('bookId') bookId: string,
    @Body('rating') rating: number,
  ) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }
    const updatedStory = await this.booksService.rateStory(bookId, rating);
    return {
      message: 'Rating updated successfully',
      rating: updatedStory.rating,
      votes: updatedStory.votes,
    };
  }

  @Get(':bookId')
  async getBookById(@Param('bookId') bookId: string) {
    const story = await this.booksService.getStoryById(bookId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    // Increment views
    story.views = (story.views || 0) + 1;
    await story.save();
    return story;
  }
}
