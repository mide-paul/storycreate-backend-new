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
  BadRequestException,
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
    try {
      return await this.postService.createPost(createPostDto, file);
    } catch (error) {
      console.error('Error in createPost controller:', error);
      throw error;
    }
  }

  @Get()
  async getPosts() {
    return this.postService.getPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Post(':id/like')
  async likePost(@Param('id') id: string, @Body() likePostDto: LikePostDto) {
    console.log('likePost called with id:', id, 'body:', likePostDto);
    if (!id) {
      console.error('Post ID parameter is missing in the request URL');
      throw new BadRequestException('Post ID parameter is missing in the request URL. Please ensure the URL includes the post ID as /posts/{postId}/like');
    }
    return this.postService.likePost(id, likePostDto);
  }

  @Post(':id/unlike')
  async unlikePost(@Param('id') id: string, @Body() likePostDto: LikePostDto) {
    if (!id) {
      throw new BadRequestException('Post ID parameter is missing in the request URL. Please ensure the URL includes the post ID as /posts/{postId}/unlike');
    }
    return this.postService.unlikePost(id, likePostDto);
  }

  @Post(':id/comment')
  async commentPost(@Param('id') id: string, @Body() commentPostDto: CommentPostDto) {
    return this.postService.commentPost(id, commentPostDto);
  }

  @Post(':postId/comments/:commentId/like')
  async likeComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() likePostDto: LikePostDto,
  ) {
    return this.postService.likeComment(postId, commentId, likePostDto);
  }

  @Post(':postId/comments/:commentId/unlike')
  async unlikeComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() likePostDto: LikePostDto,
  ) {
    return this.postService.unlikeComment(postId, commentId, likePostDto);
  }

  @Post(':postId/comments/:commentId/reply')
  async replyToComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() commentPostDto: CommentPostDto,
  ) {
    return this.postService.replyToComment(postId, commentId, commentPostDto);
  }
}
