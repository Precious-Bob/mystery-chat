import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Exclude } from 'class-transformer';

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
  profileLink: string | null;
}
