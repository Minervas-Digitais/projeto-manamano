import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMailDto } from './dto/create-mail.dto';
@Injectable()
export class MailService {
  constructor(private prismaService: PrismaService) {}

  async sendMail(email: CreateMailDto) {
    const transporter = this.getTransporter();

    const user = await this.prismaService.user.findUnique({
      where: {
        id: email.userId,
      },
    });

    const emailContent = `
Nova mensagem da(o) usuária(o) ${user.fullName}

${email.text}
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: process.env.SMTP_USERNAME,
      cc: user.email,
      subject: email.subject,
      text: emailContent,
    });
    return {
      message: 'Mail sent successfully',
    };
  }

  getTransporter() {
    return nodemailer.createTransport({
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
