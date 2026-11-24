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
import { GroupPublic, GroupWithInvite } from './group.types';
import { User } from 'src/user/user.decorator';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { InviteService, RegeneratedInvite } from './invite.service';
import { INVITE_MESSAGES } from 'src/messages/invite.messages';

@Controller('group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly inviteService: InviteService,
  ) {}

  @HttpCode(201)
  @Post()
  create(
    @User('id') callerId: string,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupWithInvite> {
    return this.groupService.create(createGroupDto, callerId);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<Group>> {
    return this.groupService.findAll(pagination);
  }

  @HttpCode(200)
  @Get(':groupId')
  findOne(
    @Param('groupId') groupId: string,
    @User('id') callerId: string,
  ): Promise<GroupWithInvite | GroupPublic> {
    return this.groupService.findOne(groupId, callerId);
  }

  @HttpCode(201)
  @Post(':groupId/invite/regenerate')
  regenerateInvite(
    @Param('groupId') groupId: string,
    @User('id') callerId: string,
  ): Promise<RegeneratedInvite> {
    return this.inviteService.regenerate(groupId, callerId);
  }

  @HttpCode(200)
  @Delete(':groupId/invite')
  async revokeInvite(
    @Param('groupId') groupId: string,
    @User('id') callerId: string,
  ): Promise<{ message: string; revoked: boolean }> {
    const { revoked } = await this.inviteService.revoke(groupId, callerId);

    return { message: INVITE_MESSAGES.REVOKED, revoked };
  }

  @HttpCode(201)
  @Patch(':groupId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
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
  remove(@Param('groupId') groupId: string): Promise<{ message: string }> {
    return this.groupService.remove(groupId);
  }
}
