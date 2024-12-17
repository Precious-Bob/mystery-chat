import { BadRequestException, Injectable } from '@nestjs/common';
import { sendMessageDto } from 'src/dto';
import { MessageEntity } from 'src/entities/message.entity';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepo: Repository<MessageEntity>,
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // recipient = recipientProfileSlug
  async sendMessage({
    recipientSlug,
    content,
  }: sendMessageDto): Promise<MessageEntity> {
    const recipient = await this.userRepo.findOne({
      where: { profileSlugOrLink: recipientSlug },
    });

    if (!recipient) throw new BadRequestException('Recipient not found');

    // Create and save message
    const message = this.messageRepo.create({
      content,
      recipient,
    });

    return this.messageRepository.save(message);
  }
}
