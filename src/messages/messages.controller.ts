import { Controller, Get, Post, Query, Param, Body, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Request } from 'express';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async fetchMessages() {
    return this.messagesService.findAll();
  }

  @Get('search')
  async searchMessages(@Query('q') query: string) {
    return this.messagesService.search(query);
  }

  @Post(':conversationId/send')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
    @Req() req: Request,
  ) {
    // TODO: Replace with actual authenticated user id
    const senderId = (req as any).user?.id || '000000000000000000000000'; // placeholder ObjectId string

    return this.messagesService.sendMessage(conversationId, content, senderId);
  }
}
