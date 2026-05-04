import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Archive, RoleType, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_MESSAGES } from 'src/messages/user.messages';
import { omitHash } from 'src/utils/user.util';
import { ValidatorService } from 'src/common/validators/validator.service';
import { UserPrivateFields, UserPublicFields } from './user.types';
export const roundsOfHashing = 10;

interface ProfilePictureBuffer {
  buffer: Buffer;
  mimeType: string;
  name: string;
}

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'hash'>> {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      },
    });

    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.EMAIL_OR_PHONE_IN_USE);
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    const userData = {
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      phone: createUserDto.phone,
      hash: hashedPassword,
      savedPost: [],
      birthday: createUserDto.birthday,
      ethnicity: createUserDto.ethnicity,
      neighborhood: createUserDto.neighborhood,
      expertise: createUserDto.expertise,
      enterprise: createUserDto.enterprise,
      bio: createUserDto.bio,
    };

    const user = await this.prismaService.user.create({ data: userData });

    return omitHash(user);
  }

  async findOne(
    targetUserId: string,
    requesterUserId: string,
  ): Promise<UserPublicFields | UserPrivateFields> {
    const user = await this.validator.validateUserExists(targetUserId);

    if (requesterUserId === targetUserId) {
      return omitHash(user);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      bio: user.bio,
      enterprise: user.enterprise,
      expertise: user.expertise,
      neighborhood: user.neighborhood,
      ethnicity: user.ethnicity,
      birthday: user.birthday,
      profilePictureId: user.profilePictureId,
    };
  }

  async findAll(): Promise<Omit<User, 'hash'>[]> {
    const users = await this.prismaService.user.findMany();
    if (users.length === 0) {
      throw new NotFoundException(USER_MESSAGES.EMPTY_LIST);
    }
    return users.map(omitHash);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'hash'>> {
    await this.validator.validateUserExists(id);
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
    return omitHash(updatedUser);
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
    oldPassword: string,
    newPassword: string,
  ): Promise<Omit<User, 'hash'>> {
    const user = await this.validator.validateUserExists(id);

    if (oldPassword === newPassword) {
      throw new ConflictException(USER_MESSAGES.SAME_PASSWORD);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: { hash: hashedPassword },
    });

    return omitHash(updatedUser);
  }

  async updateUserRole(
    id: string,
    sysRole: RoleType,
  ): Promise<Omit<User, 'hash'>> {
    await this.validator.validateUserExists(id);

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: { sysRole: sysRole },
    });

    return omitHash(updatedUser);
  }

  async updateProfilePicture(
    id: string,
    file: Express.Multer.File,
  ): Promise<Omit<User, 'hash'> & { profilePicture: Archive | null }> {
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
      ...omitHash(updatedUser),
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

  async findById(id: string): Promise<Omit<User, 'hash'>> {
    const user = await this.validator.validateUserExists(id);
    return user;
  }
}
