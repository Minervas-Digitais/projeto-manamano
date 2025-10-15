import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { RoleType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_MESSAGES } from 'src/messages/user.messages';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      },
    });
    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.EMAIL_OR_PHONE_IN_USE);
    }

    const passwordPlainText = createUserDto.hash;

    const hashedPassword = await bcrypt.hash(
      passwordPlainText,
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

    // Cria e remove o hash do objeto do usuario que será retornado
    const user = await this.prismaService.user.create({ data: userData });
    delete user.hash;

    return user;
  }

  async findAll() {
    const users = await this.prismaService.user.findMany();
    if (users.length === 0) {
      throw new NotFoundException(USER_MESSAGES.EMPTY_LIST);
    }
    return users;
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prismaService.user.delete({
      where: { id },
    });
    return { message: USER_MESSAGES.DELETE_SUCCESS };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.findOne(id);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

    return await this.prismaService.user.update({
      where: { id: id },
      data: { hash: hashedPassword },
    });
  }
  async updateUserRole(id: string, sysRole: RoleType) {
    await this.findOne(id);

    return this.prismaService.user.update({
      where: { id: id },
      data: { sysRole: sysRole },
    });
  }

  async updateProfilePicture(id: string, file: Express.Multer.File) {
    await this.findOne(id);

    const archive = await this.prismaService.archive.create({
      data: {
        name: file.originalname,
        mimeType: file.mimetype,
        contentBase64: file.buffer.toString('base64'),
        userId: id,
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

    return updatedUser;
  }

  async getProfilePictureBuffer(id: string) {
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
}
