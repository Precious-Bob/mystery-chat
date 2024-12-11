// import { Body, Controller, Post } from '@nestjs/common';
// import { EmailService } from './email.service';

// @Controller('email')
// export class EmailController {
//   constructor(private readonly emailService: EmailService) {}

//   @Post('send')
//   async sendEmail() {
//     const result = await this.emailService.sendWelcomeMail(user);
//     return {
//       message: 'Email sent successfully',
//       messageId: result?.messageId,
//     };
//   }
// }
