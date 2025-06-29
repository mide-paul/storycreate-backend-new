import { Controller, Get, Post, Query, Param, Body, Req, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Request } from 'express';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadImage } from 'src/utils/uploader';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async fetchMessages(@Req() req: any) {
    const userId = req.user?.id;
    return this.messagesService.findAll(userId);
  }

  @Get('search')
  async searchMessages(@Query('q') query: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.messagesService.search(query, userId);
  }

  @Post(':conversationId/send')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const senderId = (req as any).user?.id || '000000000000000000000000'; // placeholder ObjectId string

    let fileUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await uploadImage({ data: file.buffer, directory: 'messages' });
        fileUrls.push(uploaded.secure_url);
      }
    }

    return this.messagesService.sendMessage(conversationId, content, senderId, fileUrls);
  }

  @Post('conversations')
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    const { participantId } = createConversationDto;
    return this.messagesService.createConversation(participantId);
  }
}
