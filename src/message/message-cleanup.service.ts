import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';

@Injectable()
export class MessageCleanupService {
  private readonly logger = new Logger(MessageCleanupService.name);

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async deleteExpiredMessages() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
    try {
      const result = await this.messageRepo.delete({
        createdAt: LessThan(threeDaysAgo),
      });
      this.logger.log(
        `Successfully deleted ${result.affected} expired messages`,
      );
    } catch (error) {
      this.logger.error('Failed to delete expired messages:', error);
    }
  }
}
