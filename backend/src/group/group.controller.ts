import {
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
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupService } from './group.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Group } from '@prisma/client';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @HttpCode(201)
  @Post()
  create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupService.create(createGroupDto);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(): Promise<Group[]> {
    return this.groupService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Group> {
    return this.groupService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.update(id, updateGroupDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.groupService.remove(id);
  }
}
