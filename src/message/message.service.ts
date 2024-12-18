import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

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

    // Create and save message
    const msg = this.messageRepo.create({
      content,
      recipient,
    });

    const data = await this.messageRepo.save(msg);
    const msgResponse = {
      message: 'success',
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
}

//write controller and test endpoint
