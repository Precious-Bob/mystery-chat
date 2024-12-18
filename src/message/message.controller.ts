import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':recipientSlug')
  async sendMessage(
    @Param('recipientSlug') recipientSlug: string,
    @Body('content') content: string,
  ) {
    return this.messageService.sendMessage(recipientSlug, content);
  }

  @Get('myInbox')
  @UseGuards(AuthGuard)
  async getInbox(@User() user: UserEntity) {
    return await this.messageService.getInbox(user.id);
  }
}
