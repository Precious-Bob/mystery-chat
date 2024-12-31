import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Exclude } from 'class-transformer';
import { MessageEntity } from './message.entity';

@Entity()
export class UserEntity extends AbstractEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Add { toPlainOnly: true } if you want to work with the password
  password: string;

  @Column({ nullable: true })
  profileSlugOrLink: string | null;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpires: Date;

  @OneToMany(() => MessageEntity, (message) => message.recipient)
  receivedMessages: MessageEntity[];
}
