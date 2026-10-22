import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordResetService } from './password-reset.service';
import { User as UserDecorator } from 'src/user/user.decorator';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
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

  @HttpCode(200)
  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: FIFTEEN_MINUTES_MS } })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.passwordResetService.requestReset(forgotPasswordDto);
  }

  @HttpCode(200)
  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: FIFTEEN_MINUTES_MS } })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(resetPasswordDto);
  }
}
