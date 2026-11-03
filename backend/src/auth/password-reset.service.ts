import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { AUTH_MESSAGES } from 'src/messages/auth.messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { roundsOfHashing } from 'src/user/user.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

export const PASSWORD_RESET_CODE_TTL_MINUTES = 10;
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 10;
export const PASSWORD_RESET_MAX_ATTEMPTS = 5;
export const PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW = 6;
export const PASSWORD_RESET_REQUEST_WINDOW_MINUTES = 60;

const MINUTE_MS = 60 * 1000;

/**
 * Fluxo "Esqueci minha senha" com código numérico de 6 dígitos enviado por e-mail
 * e emissão de resetToken de uso único para a tela de nova senha.
 * Decisões e justificativas: modelagem/telassenha.md e modelagem/senhaImplementacao.md.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Sempre responde a mesma mensagem, exista ou não a conta, para não permitir
   * enumeração de usuários. O e-mail é disparado sem aguardar o SMTP.
   */
  async requestReset({ email }: ForgotPasswordDto): Promise<{ message: string }> {
    const secret = this.getSecret();

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user) {
      const now = new Date();
      const windowStart = new Date(
        now.getTime() - PASSWORD_RESET_REQUEST_WINDOW_MINUTES * MINUTE_MS,
      );

      await this.prismaService.passwordReset.deleteMany({
        where: { userId: user.id, createdAt: { lt: windowStart } },
      });

      const recentRequests = await this.prismaService.passwordReset.count({
        where: { userId: user.id, createdAt: { gte: windowStart } },
      });

      if (recentRequests >= PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW) {
        this.logger.warn(
          `Limite de solicitações de redefinição atingido para o usuário ${user.id}`,
        );
        return { message: AUTH_MESSAGES.FORGOT_PASSWORD_REQUESTED };
      }

      const code = this.generateCode();

      await this.prismaService.$transaction([
        this.prismaService.passwordReset.updateMany({
          where: { userId: user.id, invalidatedAt: null },
          data: { invalidatedAt: now },
        }),
        this.prismaService.passwordReset.create({
          data: {
            userId: user.id,
            codeHash: this.hashCode(user.id, code, secret),
            expiresAt: new Date(now.getTime() + PASSWORD_RESET_CODE_TTL_MINUTES * MINUTE_MS),
          },
        }),
      ]);

      this.mailService
        .sendPasswordResetCode(user.email, user.fullName, code, PASSWORD_RESET_CODE_TTL_MINUTES)
        .catch((error: unknown) => {
          this.logger.error(
            `Falha ao enviar código de redefinição para o usuário ${user.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        });
    }

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_REQUESTED };
  }

  /**
   * Valida o código OTP de 6 dígitos e devolve um token de uso único (resetToken)
   * com validade de 10 minutos para ser utilizado no formulário de nova senha.
   * Toda falha retorna a mesma mensagem genérica.
   */
  async verifyResetCode({ email, code }: VerifyResetCodeDto): Promise<{ resetToken: string }> {
    const secret = this.getSecret();
    const invalidCode = new BadRequestException(AUTH_MESSAGES.INVALID_OR_EXPIRED_CODE);

    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw invalidCode;

    const now = new Date();

    const resetRequest = await this.prismaService.passwordReset.findFirst({
      where: { userId: user.id, invalidatedAt: null, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!resetRequest) throw invalidCode;

    // Reserva a tentativa antes de comparar: requisições concorrentes não
    // conseguem ultrapassar o limite de tentativas.
    const reserved = await this.prismaService.passwordReset.updateMany({
      where: {
        id: resetRequest.id,
        invalidatedAt: null,
        verifiedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: PASSWORD_RESET_MAX_ATTEMPTS },
      },
      data: { attempts: { increment: 1 } },
    });
    if (reserved.count === 0) throw invalidCode;

    if (!this.codeMatches(resetRequest.codeHash, this.hashCode(user.id, code, secret))) {
      throw invalidCode;
    }

    const resetToken = randomBytes(32).toString('base64url');
    const resetTokenHash = this.hashResetToken(resetToken);
    const resetTokenExpiresAt = new Date(
      now.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * MINUTE_MS,
    );

    const verified = await this.prismaService.passwordReset.updateMany({
      where: { id: resetRequest.id, verifiedAt: null, invalidatedAt: null },
      data: {
        verifiedAt: now,
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });
    if (verified.count === 0) throw invalidCode;

    return { resetToken };
  }

  /**
   * Consome o resetToken de uso único, atualiza a senha da usuária com bcrypt,
   * anula o refreshToken no banco (revoga sessões em outros aparelhos)
   * e dispara e-mail de alerta de segurança.
   */
  async resetPassword({ resetToken, newPassword }: ResetPasswordDto): Promise<{ message: string }> {
    const invalidToken = new BadRequestException(AUTH_MESSAGES.INVALID_OR_EXPIRED_RESET_TOKEN);
    const resetTokenHash = this.hashResetToken(resetToken);

    const now = new Date();

    const resetRequest = await this.prismaService.passwordReset.findUnique({
      where: { resetTokenHash },
      include: { user: true },
    });

    if (
      !resetRequest ||
      resetRequest.invalidatedAt !== null ||
      resetRequest.verifiedAt === null ||
      !resetRequest.resetTokenExpiresAt ||
      resetRequest.resetTokenExpiresAt <= now
    ) {
      throw invalidToken;
    }

    const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

    await this.prismaService.$transaction(async (tx) => {
      const consumed = await tx.passwordReset.updateMany({
        where: {
          id: resetRequest.id,
          invalidatedAt: null,
          resetTokenExpiresAt: { gt: now },
        },
        data: { invalidatedAt: now },
      });
      if (consumed.count === 0) throw invalidToken;

      await tx.user.update({
        where: { id: resetRequest.userId },
        data: { hash: hashedPassword, refreshToken: null },
      });

      await tx.passwordReset.deleteMany({ where: { userId: resetRequest.userId } });
    });

    this.mailService
      .sendPasswordChangedAlert(resetRequest.user.email, resetRequest.user.fullName, now)
      .catch((error: unknown) => {
        this.logger.error(
          `Falha ao enviar alerta de senha alterada para o usuário ${resetRequest.userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      });

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  /**
   * HMAC-SHA256 com segredo do servidor (pepper). Um SHA-256 puro de um código de
   * 6 dígitos seria revertido por força bruta em milissegundos após um vazamento
   * do banco; o userId vincula o código à conta.
   */
  private hashCode(userId: string, code: string, secret: string): string {
    return createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private codeMatches(storedHash: string, candidateHash: string): boolean {
    const stored = Buffer.from(storedHash, 'hex');
    const candidate = Buffer.from(candidateHash, 'hex');
    return stored.length === candidate.length && timingSafeEqual(stored, candidate);
  }

  private getSecret(): string {
    const secret = process.env.PASSWORD_RESET_SECRET;

    if (!secret) {
      this.logger.error('PASSWORD_RESET_SECRET não configurado.');
      throw new InternalServerErrorException(AUTH_MESSAGES.PASSWORD_RESET_NOT_CONFIGURED);
    }

    return secret;
  }
}
