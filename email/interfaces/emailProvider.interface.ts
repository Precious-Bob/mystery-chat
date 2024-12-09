// interfaces/email-provider.interface.ts
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
export interface IEmailProvider {
  sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<EmailResponse>;
}
