import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class EmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeMail(user: UserEntity) {
    const options: nodemailer.SendMailOptions = {
      from: {
        name: this.config.get('EMAIL_FROM'),
        address: this.config.get('EMAIL_ADDRESS'),
      },
      to: user.email,
      subject: 'Welcome to Mystery Chat',
      template: 'welcome',
      context: {
        username: user.username,
      },
    };

    const result = await this.mailerService.sendMail(options);

    try {
      return result;
    } catch (error) {
      console.log('error sending email', error);
    }
  }
}
