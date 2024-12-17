import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity()
export class MessageEntity extends AbstractEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.receivedMessages, {
    onDelete: 'CASCADE',
  })
  recipient: UserEntity;

  @Column({ nullable: true })
  encryptedSenderEmail: string; // For potential reveal feature
}
