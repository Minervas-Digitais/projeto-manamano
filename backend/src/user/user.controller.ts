import {
    BadRequestException,
    UnauthorizedException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
    Req,
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
import { NotFoundException, Res } from '@nestjs/common';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @HttpCode(201)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @HttpCode(200)
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.userService.findAll();
    }

    @HttpCode(200)
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @HttpCode(201)
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @HttpCode(200)
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @HttpCode(201)
    @Patch(':id/change-password')
    @UseGuards(JwtAuthGuard)
    changePassword(
        @Param('id') id: string,
        @Body('oldPassword') oldPassword: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.userService.changePassword(id, oldPassword, newPassword);
    }

    @Patch(':id/role')
    async updateRole(
        @Param('id') id: string,
        @Body() updateUserRoleDto: UpdateUserRoleDto,
    ) {
        const { role } = updateUserRoleDto;
        return this.userService.updateUserRole(id, role);
    }

    @Patch(':id/profile-picture')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async updateProfilePicture(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Um arquivo é necessário.');
        }
        return this.userService.updateProfilePicture(id, file);
    }

    @Get(':id/profile-picture')
    async getProfilePicture(@Param('id') id: string, @Res() res: express.Response) {
        const { buffer, mimeType, name } = await this.userService.getProfilePictureBuffer(id);

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `inline; filename="${name}"`,
        });

        res.send(buffer);
    }

    
}
