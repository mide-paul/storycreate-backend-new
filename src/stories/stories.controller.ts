import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CommentsService } from './comments.service';
import { PostCommentDto } from './dto/post-comment.dto';

@Controller('books')
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createStory(
    @Body() createStoryDto: CreateStoryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(application\/pdf|image\/.*)/ }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.storiesService.createStory(createStoryDto, file);
  }

  @Get('sponsored-posts')
  async getSponsoredPosts() {
    return this.storiesService.getStoriesByCategory('sponsored-posts');
  }

  @Get('readers-favourite')
  async getReadersFavourite() {
    return this.storiesService.getStoriesByCategory('readers-favourite');
  }

  @Get('highly-rated')
  async getHighlyRated() {
    return this.storiesService.getStoriesByCategory('highly-rated');
  }

  @Get('exciting-genre')
  async getExcitingGenre() {
    return this.storiesService.getStoriesByCategory('exciting-genre');
  }

  @Get('audio-books')
  async getAudioBooks() {
    return this.storiesService.getStoriesByCategory('audio-books');
  }

  @Get('anime-stories')
  async getAnimeStories() {
    return this.storiesService.getStoriesByCategory('anime-stories');
  }

  @Get('graphic-novels')
  async getGraphicNovels() {
    return this.storiesService.getStoriesByCategory('graphic-novels');
  }

  @Get(':bookId')
  async getBookById(@Param('bookId') bookId: string) {
    return this.storiesService.getStoryById(bookId);
  }

  @Get(':bookId/comments')
  async getComments(@Param('bookId') bookId: string) {
    return this.commentsService.getCommentsByStoryId(bookId);
  }

  @Post(':bookId/comments')
  async postComment(
    @Param('bookId') bookId: string,
    @Body() postCommentDto: PostCommentDto,
  ) {
    const { userId, content } = postCommentDto;
    return this.commentsService.addComment(bookId, userId, content);
  }
}
