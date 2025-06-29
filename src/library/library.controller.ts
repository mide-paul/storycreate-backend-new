import { Controller, Get, Post, Body, Req, UseInterceptors } from '@nestjs/common';
import { LibraryService } from './library.service';
import { UserService } from '../user/user.service';
import { AuthTokenGuard } from '../interceptors/validator';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('library')
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly userService: UserService,
  ) {}

  @Get('keep-reading')
  async getKeepReading() {
    return this.libraryService.getStoriesByStatus('keep-reading');
  }

  @Get('continue-writing')
  async getContinueWriting() {
    return this.libraryService.getStoriesByStatus('continue-writing');
  }

  @Get('saved-books')
  @UseInterceptors(AuthTokenGuard)
  async getSavedBooks(@Req() req: Request & { user: any }) {
    if (!req.user) {
      return { statusCode: 401, message: 'Unauthorized' };
    }
    const user = await this.userService.findOne(req.user.id);
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }
    await user.populate('savedBooks');

    // Separate savedBooks into DB stories and sample stories
    const savedBookIds = user.savedBooks.map((book: any) => book._id.toString());

    const dbStoryIds = user.savedBooks.filter((book: any) => Types.ObjectId.isValid(book._id.toString())).map((book: any) => book._id.toString());

    const sampleStoryIds = savedBookIds.filter(id => !dbStoryIds.includes(id));
    
    // Get sample stories from JSON
    const sampleStories = sampleStoryIds.length > 0 ? (await import('../scripts/sample-stories.service')).SampleStoriesService.getStoriesByIds(sampleStoryIds) : [];

    // Combine DB stories and sample stories
    const dbStories = user.savedBooks.filter((book: any) => Types.ObjectId.isValid(book._id.toString()));
    const combinedStories = [...dbStories, ...sampleStories];

    return { statusCode: 200, data: combinedStories };
  }

  @Get('books-to-publish')
  async getBooksToPublish() {
    return this.libraryService.getStoriesByStatus('books-to-publish');
  }

  @Get('submitted-for-review')
  async getSubmittedForReview() {
    return this.libraryService.getStoriesByStatus('submitted-for-review');
  }

  @Get('read-again')
  async getReadAgain() {
    return this.libraryService.getStoriesByStatus('read-again');
  }

  @Get('published-books')
  async getPublishedBooks() {
    return this.libraryService.getStoriesByStatus('published-books');
  }

  @Post('saved-books')
  @UseInterceptors(AuthTokenGuard)
  async addBookToSaved(
    @Req() req: Request & { user: any },
    @Body('bookId') bookId: string,
  ) {
    if (!req.user) {
      return { statusCode: 401, message: 'Unauthorized' };
    }
    if (!bookId) {
      return { statusCode: 400, message: 'bookId is required' };
    }
    try {
      const { updatedUser, alreadySaved } = await this.userService.addBookToSaved(req.user.id, bookId);
      if (alreadySaved) {
        return { statusCode: 409, message: 'Book is already saved', data: updatedUser };
      }
      return { statusCode: 200, message: 'Book added to saved books', data: updatedUser };
    } catch (error) {
      return { statusCode: 500, message: 'Failed to add book to saved books', error: error.message };
    }
  }
}
