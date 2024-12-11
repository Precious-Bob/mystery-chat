import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from 'src/dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.emailService.sendMail(dto);
    return {
      message: 'Email sent successfully',
      messageId: result?.messageId,
    };
  }
}
