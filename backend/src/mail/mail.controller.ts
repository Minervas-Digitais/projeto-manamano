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
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';

@Controller('mail')
@UseGuards(JwtAuthGuard, MatchUserIdGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(201)
  @Post()
  sendMail(@Body() email: CreateMailDto, @Req() req) {
    return this.mailService.sendMail(email, req.user.id);
  }
}
