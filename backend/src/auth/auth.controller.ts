import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  THROTTLE_LOGIN_LIMIT,
  THROTTLE_LOGIN_TTL_MS,
} from 'src/common/throttling/throttling.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User as UserDecorator } from 'src/user/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: THROTTLE_LOGIN_LIMIT, ttl: THROTTLE_LOGIN_TTL_MS } })
  login(@Body() createLoginDto: LoginDto) {
    return this.authService.login(createLoginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshLoginDto: RefreshDto) {
    return this.authService.refresh(refreshLoginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@UserDecorator('id') userId: string) {
    return this.authService.logout(userId);
  }
}
