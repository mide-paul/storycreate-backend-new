import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { CommentPostDto } from './dto/comment-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.postService.createPost(createPostDto, file);
  }

  @Get()
  async getPosts() {
    return this.postService.getPosts();
  }

  @Post(':id/like')
  async likePost(@Param('id') id: string, @Body() likePostDto: LikePostDto) {
    return this.postService.likePost(id, likePostDto);
  }

  @Post(':id/comment')
  async commentPost(@Param('id') id: string, @Body() commentPostDto: CommentPostDto) {
    return this.postService.commentPost(id, commentPostDto);
  }
}
