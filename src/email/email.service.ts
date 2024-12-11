import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from 'src/dto';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  // Create a memoized transporter to improve performance
  private transporterInstance: nodemailer.Transporter | null = null;

  private createTransporter(): nodemailer.Transporter {
    if (this.transporterInstance) {
      return this.transporterInstance;
    }

    this.transporterInstance = nodemailer.createTransport({
      host: this.config.getOrThrow('EMAIL_HOST'),
      port: this.config.getOrThrow('EMAIL_PORT'),
      secure: this.config.get('EMAIL_SECURE', false), // true for port 465, false for other ports
      auth: {
        user: this.config.getOrThrow('EMAIL_USER'),
        pass: this.config.getOrThrow('EMAIL_PASS'),
      },
    });
    return this.transporterInstance;
  }

  async sendMail(dto: SendEmailDto) {
    const { recipients, subject, html } = dto;
    const transport = this.createTransporter();

    const options: nodemailer.SendMailOptions = {
      from: {
        name: this.config.get('EMAIL_FROM'),
        address: this.config.get('EMAIL_ADDRESS'),
      },
      to: recipients,
      subject,
      html,
    };
    console.log(options);

    const result = await transport.sendMail(options);
    try {
      return result;
    } catch (error) {
      console.log('error sending email', error);
    }
  }
}
