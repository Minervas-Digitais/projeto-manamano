import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailService } from './mail.service';

import { User } from 'src/user/user.decorator';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(201)
  @Post()
  sendMail(@Body() email: CreateMailDto, @User('id') userId: string) {
    return this.mailService.sendMail(email, userId);
  }
}
