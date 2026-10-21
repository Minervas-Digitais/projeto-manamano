import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserThrottlerGuard } from 'src/auth/user-throttler.guard';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailService } from './mail.service';

import { User } from 'src/user/user.decorator';

@Controller('mail')
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(201)
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  sendMail(@Body() email: CreateMailDto, @User('id') userId: string) {
    return this.mailService.sendMail(email, userId);
  }
}
