import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordResetService } from './password-reset.service';
import { User as UserDecorator } from 'src/user/user.decorator';

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
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.passwordResetService.requestReset(forgotPasswordDto);
  }

  @HttpCode(200)
  @Post('verify-reset-code')
  verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.passwordResetService.verifyResetCode(verifyResetCodeDto);
  }

  @HttpCode(200)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(resetPasswordDto);
  }
}
