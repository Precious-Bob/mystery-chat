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

  /**
   * Sends a message to a recipient identified by profileSlugOrLink.
   * @param {string} profileSlugOrLink - The profile slug or link of the recipient.
   * @param {string} content - The content of the message.
   * @returns {Promise<Object>} - The response object containing the message details.
   * @throws {NotFoundException} - If the recipient is not found.
   * @throws {BadRequestException} - If the message content is invalid.
   */
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

  /**
   * Retrieves the inbox messages for a user.
   * @param {string} id - The ID of the user.
   * @returns {Promise<Object>} - The response object containing the messages.
   */
  async getInbox(id: string) {
    const messages = await this.messageRepo.find({
      where: { recipient: { id } },
      order: { createdAt: 'DESC' },
    });
    const msg = messages.length > 0 ? 'Messages retrieved' : 'No messages yet';
    return { message: 'success', length: messages.length, data: msg };
  }
}
