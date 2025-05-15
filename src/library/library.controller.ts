import { Controller, Get } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('keep-reading')
  async getKeepReading() {
    return this.libraryService.getStoriesByStatus('keep-reading');
  }

  @Get('continue-writing')
  async getContinueWriting() {
    return this.libraryService.getStoriesByStatus('continue-writing');
  }

  @Get('saved-books')
  async getSavedBooks() {
    return this.libraryService.getStoriesByStatus('saved-books');
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
}
