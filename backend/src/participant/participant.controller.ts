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
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantRoleDto } from './dto/update-participant.dto';
import {
  GroupWithDetails,
  ParticipantService,
  UserInGroup,
} from './participant.service';
import { Participant, RoleType } from '@prisma/client';
import { User } from 'src/user/user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('participant')
@UseGuards(JwtAuthGuard)
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @HttpCode(201)
  @Post()
  joinGroup(
    @Body() createParticipantDto: CreateParticipantDto,
    @User('id') userId: string,
  ): Promise<Participant> {
    return this.participantService.joinGroupWithInvite(
      createParticipantDto,
      userId,
    );
  }

  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get()
  findAll(): Promise<Participant[]> {
    return this.participantService.findAll();
  }

  @HttpCode(200)
  @Get('group/:groupId/users')
  findUsersInGroup(
    @Param('groupId') groupId: string,
    @User('id') callerId: string,
  ): Promise<UserInGroup[]> {
    return this.participantService.findUsersInGroup(groupId, callerId);
  }

  @HttpCode(200)
  @Get('groups/')
  findUserGroups(@User('id') userId: string): Promise<GroupWithDetails[]> {
    return this.participantService.findUserGroups(userId);
  }

  @HttpCode(200)
  @Get('groups/posts')
  @UseGuards(JwtAuthGuard)
  findUserGroupsPosts(
    @User('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 15;
    return this.participantService.findUserGroupsPostsPaginated(
      userId,
      pageNumber,
      limitNumber,
    );
  }

  @HttpCode(200)
  @Get('group/:groupId/me')
  findOne(
    @User('id') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<Participant> {
    return this.participantService.findOne(userId, groupId);
  }

  @HttpCode(200)
  @Patch('/group/:groupId/user/:targetUserId/role')
  updateUserRole(
    @User('id') callerId: string,
    @Param('groupId') groupId: string,
    @Param('targetUserId') targetUserId: string,
    @Body()
    updateParticipantDto: UpdateParticipantRoleDto,
  ): Promise<Participant> {
    return this.participantService.update(
      callerId,
      targetUserId,
      groupId,
      updateParticipantDto,
    );
  }

  @HttpCode(200)
  @Delete('group/:groupId')
  removeSelf(
    @User('id') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<{ message: string }> {
    return this.participantService.removeSelf(userId, groupId);
  }

  @HttpCode(200)
  @Delete('group/:groupId/user/:userId')
  removeUser(
    @User('id') callerId: string,
    @Param('groupId') groupId: string,
    @Param('userId') targetId: string,
  ): Promise<{ message: string }> {
    return this.participantService.removeUser(callerId, targetId, groupId);
  }
}
