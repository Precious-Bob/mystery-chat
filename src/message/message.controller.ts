import {
  Body,
  Controller,
  Delete,
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
    const userId = user.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID is missing');
    }
    const result = await this.messageService.getInbox(userId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteMessage(@Param('id') id: string, @User() user: any) {
    await this.messageService.deleteMessage(id, user.sub);
    return { message: 'Message deleted successfully' };
  }
}
