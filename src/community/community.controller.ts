import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityService } from './community.service';

import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // "image" must match field name from frontend
  async createCommunity(
    @UploadedFile() image: Express.Multer.File,
    @Body() createCommunityDto: CreateCommunityDto,
  ) {
    return this.communityService.createCommunity(createCommunityDto, image);
  }

  @Get()
  async getCommunities() {
    return this.communityService.getCommunities();
  }

  @Post(':communityId/join')
  async joinCommunity(
    @Param('communityId', ParseObjectIdPipe) communityId: string,
    @Body('userId') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId in request body is required');
    }
    return this.communityService.joinCommunity(communityId, userId);
  }

  @Get(':communityId')
  async getCommunityById(
    @Param('communityId', ParseObjectIdPipe) communityId: string,
  ) {
    return this.communityService.getCommunityById(communityId);
  }
}
