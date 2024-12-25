import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { UserEntity } from 'src/entities/user.entity';
import { createPaginationLinks } from 'src/utils/paginationLink.util';
import { QueryResult, Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // recipient = recipientProfileSlug
  async sendMessage(profileSlugOrLink: string, content: string) {
    const recipient = await this.userRepo.findOne({
      where: { profileSlugOrLink },
    });

    if (!recipient) throw new NotFoundException('Recipient not found');

    // Validate message content
    if (!content || content.trim().length === 0)
      throw new BadRequestException('Message content cannot be empty');

    if (content.trim().length > 500)
      throw new BadRequestException(
        'Message content cannot be longer than 500 characters',
      );

    const msg = this.messageRepo.create({
      content,
      recipient,
    });

    const data = await this.messageRepo.save(msg);
    const msgResponse = {
      id: data.id,
      content: data.content,
      createdAt: data.createdAt,
      recipient: {
        id: data.recipient.id,
        username: data.recipient.username,
        profileSlugOrLink: data.recipient.profileSlugOrLink,
      },
    };

    return { message: 'success', data: msgResponse };
  }

  //pagination
  async getInbox(userId: string, page = 1, limit = 10) {
    console.log('Service received userId:', userId); // New log
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('User ID being queried:', userId);
    const [data, total] = await this.messageRepo.findAndCount({
      where: {
        recipient: { id: userId }, // Make sure we're using the correct field name
      },
      order: { createdAt: 'DESC' },
      skip: page > 0 ? (page - 1) * limit : 0,
      take: limit,
    });

    console.log('Raw query result:', QueryResult); // New log

    const msg = total > 0 ? 'Messages retrieved' : 'No messages yet';
    const links = createPaginationLinks(page, limit, total, 'messages');
    const response = {
      total,
      page,
      limit,
      msg,
      data,
      links,
    };

    console.log('Final response:', response); // New log
    return response;
  }

  // async deleteMessage(messageId: string, userId: string) {
  //   const message = await this.messageRepo.findOne({
  //     where: { id: messageId, recipientId: userId },
  //   });

  //   if (!message) {
  //     throw new BadRequestException(
  //       'Message not found or you do not have permission',
  //     );
  //   }

  //   await this.messageRepo.remove(message);
  // }
}
