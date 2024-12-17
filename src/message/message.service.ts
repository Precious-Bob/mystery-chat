import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sendMessageDto } from 'src/dto';
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
  async sendMessage({ recipientSlug, content }: sendMessageDto) {
    const recipient = await this.userRepo.findOne({
      where: { profileSlugOrLink: recipientSlug },
    });

    if (!recipient) throw new NotFoundException('Recipient not found');

    // Create and save message
    const msg = this.messageRepo.create({
      content,
      recipient,
    });

    const data = await this.messageRepo.save(msg);
    return { message: 'success', data };
  }
}
