import { Body, Controller, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':recipientSlug')
  async sendMessage(
    @Param('recipientSlug') recipientSlug: string,
    @Body('content') content: string,
  ) {
    return this.messageService.sendMessage(recipientSlug, content);
  }
}
