import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Archive, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { USER_MESSAGES } from 'src/messages/user.messages';
import { toPrivateUser, toPublicUser } from './user.mapper';
import { ValidatorService } from 'src/common/validators/validator.service';
import { UserPrivateFields, UserPublicFields } from './user.types';
import { TokenService } from 'src/auth/token.service';
import { AuthEntity } from 'src/auth/entity/auth.entity';
import { MailService } from 'src/mail/mail.service';
export const roundsOfHashing = 10;

interface ProfilePictureBuffer {
  buffer: Buffer;
  mimeType: string;
  name: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserPrivateFields> {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      },
    });

    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.EMAIL_OR_PHONE_IN_USE);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, roundsOfHashing);

    const userData = {
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      phone: createUserDto.phone,
      hash: hashedPassword,
      birthday: createUserDto.birthday,
      ethnicity: createUserDto.ethnicity,
      neighborhood: createUserDto.neighborhood,
      expertise: createUserDto.expertise,
      enterprise: createUserDto.enterprise,
      bio: createUserDto.bio,
    };

    const user = await this.prismaService.user.create({ data: userData });

    return toPrivateUser(user);
  }

  async findOne(
    targetUserId: string,
    requesterUserId: string,
  ): Promise<UserPublicFields | UserPrivateFields> {
    const user = await this.validator.validateUserExists(targetUserId);

    if (requesterUserId === targetUserId) {
      return toPrivateUser(user);
    }

    return toPublicUser(user);
  }

  async findAll(): Promise<UserPrivateFields[]> {
    const users = await this.prismaService.user.findMany();
    return users.map(toPrivateUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserPrivateFields> {
    await this.validator.validateUserExists(id);
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
    return toPrivateUser(updatedUser);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.validator.validateUserExists(id);
    await this.prismaService.user.delete({
      where: { id },
    });
    return { message: USER_MESSAGES.DELETE_SUCCESS };
  }

  async changePassword(
    id: string,
    { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<AuthEntity> {
    const user = await this.validator.validateUserExists(id);

    if (oldPassword === newPassword) {
      throw new ConflictException(USER_MESSAGES.SAME_PASSWORD);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

    await this.prismaService.user.update({
      where: { id: id },
      data: { hash: hashedPassword },
    });

    // Rotaciona a sessão: o refresh token anterior (de qualquer aparelho) deixa
    // de valer e o aparelho atual recebe um novo par de tokens.
    const tokens = await this.tokenService.generateTokens(user);

    this.mailService
      .sendPasswordChangedAlert(user.email, user.fullName, new Date())
      .catch((error: unknown) => {
        this.logger.error(
          `Falha ao enviar alerta de senha alterada para o usuário ${user.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      });

    return { ...tokens, loggedId: user.id };
  }

  async updateUserRole(id: string, sysRole: RoleType): Promise<UserPrivateFields> {
    await this.validator.validateUserExists(id);

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: { sysRole: sysRole },
    });

    return toPrivateUser(updatedUser);
  }

  async updateProfilePicture(
    id: string,
    file: Express.Multer.File,
  ): Promise<UserPrivateFields & { profilePicture: Archive | null }> {
    const user = await this.validator.validateUserExists(id);

    if (user.profilePictureId) {
      await this.prismaService.archive.delete({
        where: { id: user.profilePictureId },
      });
    }

    const archive = await this.prismaService.archive.create({
      data: {
        name: file.originalname,
        mimeType: file.mimetype,
        contentBase64: file.buffer.toString('base64'),
        User: { connect: { id } },
      },
    });

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        profilePictureId: archive.id,
      },
      include: {
        profilePicture: true,
      },
    });

    return {
      ...toPrivateUser(updatedUser),
      profilePicture: updatedUser.profilePicture,
    };
  }

  async getProfilePictureBuffer(id: string): Promise<ProfilePictureBuffer> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      include: { profilePicture: true },
    });

    if (!user || !user.profilePicture) {
      throw new NotFoundException(USER_MESSAGES.PROFILE_PICTURE_NOT_FOUND);
    }

    return {
      buffer: Buffer.from(user.profilePicture.contentBase64, 'base64'),
      mimeType: user.profilePicture.mimeType,
      name: user.profilePicture.name,
    };
  }

  async findById(id: string): Promise<UserPrivateFields> {
    const user = await this.validator.validateUserExists(id);
    return toPrivateUser(user);
  }
}
