import {
  Controller,
  Get,
  Post,
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
import { PostService } from '../post/post.service';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@Controller('communities/:communityId/posts')
export class CommunityPostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Param('communityId', ParseObjectIdPipe) communityId: string) {
    return this.postService.getPostsByCommunity(communityId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @Param('communityId', ParseObjectIdPipe) communityId: string,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only image files are allowed.');
      }
      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds the maximum allowed size of 10MB.');
      }
    }
    return this.postService.createPost(createPostDto, file, communityId);
  }
}
