import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from 'src/mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PasswordResetService } from './password-reset.service';
import { TokenModule } from './token.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '99999999999999999999m' },
    }),
    UserModule,
    TokenModule,
    // Também registra o ThrottlerModule (global) usado nas rotas públicas de senha.
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
})
export class AuthModule {}
