import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { MessageEntity } from 'src/entities/message.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity])],
  controllers: [MessageController],
  providers: [MessageService, JwtService],
})
export class MessageModule {}
