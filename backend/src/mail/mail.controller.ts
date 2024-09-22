import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(JwtAuthGuard)
  sendMail(@Body() email: CreateMailDto) {
    return this.mailService.sendMail(email);
  }
}
