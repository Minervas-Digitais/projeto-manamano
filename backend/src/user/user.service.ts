import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.prismaService.user.findFirst({
                where: {
                    OR: [
                        { email: createUserDto.email },
                        { phone: createUserDto.phone },
                    ],
                },
            });
            if (existingUser) {
                throw new ConflictException('Email ou telefone já está em uso.');
            }

            const hashedPassword = await bcrypt.hash(
                createUserDto.hash,
                roundsOfHashing,
            );

            createUserDto.hash = hashedPassword;
            createUserDto.savedPost = [];

            return await this.prismaService.user.create({
                data: {
                    ...createUserDto,
                    hash: createUserDto.hash,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const users = await this.prismaService.user.findMany();
            if (users.length === 0) {
                throw new NotFoundException('Não há usuários cadastrados.');
            }
            return users;
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new NotFoundException('Usuário não encontrado.');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        try {
            await this.findOne(id);
            return await this.prismaService.user.update({
                where: { id },
                data: updateUserDto,
            });
        } catch (error) {
            throw error;
        }
    }

    async remove(id: string) {
        try {
            await this.findOne(id);
            await this.prismaService.user.delete({
                where: { id },
            });
            return 'Usuário deletado com sucesso.';
        } catch (error) {
            throw error;
        }
    }

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new NotFoundException('Usuário não encontrado.');
            }

            const isPasswordValid = await bcrypt.compare(oldPassword, user.hash);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Senha inválida.');
            }

            const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

            return await this.prismaService.user.update({
                where: { id },
                data: { hash: hashedPassword },
            });
        } catch (error) {
            throw error;
        }
    }
    async updateUserRole(userId: string, sysRole: RoleType) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.prismaService.user.update({
            where: { id: userId },
            data: { sysRole },
        });
    }

    async updateProfilePicture(userId: string, file: Express.Multer.File) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const archive = await this.prismaService.archive.create({
            data: {
                name: file.originalname,
                mimeType: file.mimetype,
                contentBase64: file.buffer.toString('base64'),
                userId: userId,
            },
        });

        const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
            data: {
                profilePictureId: archive.id,
            },
            include: {
                profilePicture: true,
            },
        });

        return updatedUser;
    }

    async getProfilePictureBuffer(userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { profilePicture: true },
        });

        if (!user || !user.profilePicture) {
            throw new NotFoundException('Foto de perfil não encontrada.');
        }

        return {
            buffer: Buffer.from(user.profilePicture.contentBase64, 'base64'),
            mimeType: user.profilePicture.mimeType,
            name: user.profilePicture.name,
        };
    }
}
