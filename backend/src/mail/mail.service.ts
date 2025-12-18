import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { MAIL_MESSAGES } from 'src/messages/mail.messages';
import { ValidatorService } from 'src/common/validators/validator.service';
@Injectable()
export class MailService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  async sendMail(
    email: CreateMailDto,
    userId: string,
  ): Promise<{ message: string }> {
    const user = await this.validator.validateUserExists(userId);
  
    const transporter = this.getTransporter();

    const emailContent = `Nova mensagem da(o) usuária(o) ${user.fullName}:\n\n${email.text}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USERNAME,
        to: process.env.SMTP_USERNAME,
        cc: user.email,
        subject: email.subject,
        text: emailContent,
      });

      return { message: MAIL_MESSAGES.SEND_SUCCESS };
    } catch (error) {
      throw new InternalServerErrorException(MAIL_MESSAGES.SEND_FAILURE);
    }
  }

  getTransporter(): Transporter {
    return createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_TLS === 'yes' ? true : false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
}
