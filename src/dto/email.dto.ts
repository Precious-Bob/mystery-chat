import { IsString, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  recipients: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;
}
