import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity()
export class UserEntity extends AbstractEntity {
  @Column({ unique: true })
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ nullable: true })
  @IsOptional()
  image: string | null;

  @Column()
  @IsNotEmpty()
  @Exclude() // Add { toPlainOnly: true } if you want to work with the password
  @IsStrongPassword()
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  profileLink: string | null;
}
