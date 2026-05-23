/// <reference types="multer" />
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { Res } from '@nestjs/common';
import { Archive, RoleType, User } from '@prisma/client';
import { User as UserDecorator } from './user.decorator';
import { UserPrivateFields, UserPublicFields } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(201)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'hash'>> {
    return this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findAll(): Promise<Omit<User, 'hash'>[]> {
    return this.userService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') paramId: string,
    @UserDecorator('id') tokenId: string,
  ): Promise<UserPublicFields | UserPrivateFields> {
    return this.userService.findOne(paramId, tokenId);
  }

  @HttpCode(201)
  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @UserDecorator('id') id: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<Omit<User, 'hash'>> {
    return this.userService.changePassword(id, oldPassword, newPassword);
  }

  @HttpCode(201)
  @Patch()
  @UseGuards(JwtAuthGuard)
  update(
    @UserDecorator('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'hash'>> {
    return this.userService.update(id, updateUserDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<Omit<User, 'hash'>> {
    const { sysRole } = updateUserRoleDto;
    return this.userService.updateUserRole(id, sysRole);
  }

  @Patch('/profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(
    @UserDecorator('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Omit<User, 'hash'> & { profilePicture: Archive | null }> {
    if (!file) {
      throw new BadRequestException('Um arquivo é necessário.');
    }
    return this.userService.updateProfilePicture(id, file);
  }

  @Get(':id/profile-picture')
  async getProfilePicture(@Param('id') id: string, @Res() res: express.Response): Promise<void> {
    const { buffer, mimeType, name } = await this.userService.getProfilePictureBuffer(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${name}"`,
    });

    res.send(buffer);
  }
}
