import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupService } from './group.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Group } from '@prisma/client';
import { User } from 'src/user/user.decorator';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  /* c8 ignore next 1 */
  constructor(private readonly groupService: GroupService) {}

  @HttpCode(201)
  @Post()
  /* c8 ignore next */
  create(@User('id') callerId: string, @Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupService.create(createGroupDto, callerId);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  /* c8 ignore next */
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<Group>> {
    return this.groupService.findAll(pagination);
  }

  @HttpCode(200)
  @Get(':groupId')
  /* c8 ignore next */
  findOne(@Param('groupId') groupId: string): Promise<Group> {
    return this.groupService.findOne(groupId);
  }

  @HttpCode(201)
  @Patch(':groupId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  /* c8 ignore next 5 */
  update(
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.update(groupId, updateGroupDto);
  }

  @HttpCode(200)
  @Delete(':groupId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  /* c8 ignore next */
  remove(@Param('groupId') groupId: string): Promise<{ message: string }> {
    return this.groupService.remove(groupId);
  }
}
