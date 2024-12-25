import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';

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
  async getInbox(@User() user: any) {
    console.log('Complete user object :', user);
    const userId = user.sub;
    console.log('Extracted userId:', userId); // New log
    if (!userId) {
      throw new UnauthorizedException('User ID is missing');
    }
    const result = await this.messageService.getInbox(userId);
    console.log('Service returned:', result); // New log
    return result;
  }
}
