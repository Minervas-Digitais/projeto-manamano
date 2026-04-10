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
import { UpdateParticipantDto } from './dto/update-participant.dto';
import {
  GroupWithDetails,
  ParticipantService,
  UserInGroup,
} from './participant.service';
import { Participant } from '@prisma/client';
import { User } from 'src/user/user.decorator';

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
  @Get()
  findAll(): Promise<Participant[]> {
    return this.participantService.findAll();
  }

  @HttpCode(200)
  @Get('group/:groupId')
  findUsersInGroup(@Param('groupId') groupId: string): Promise<UserInGroup[]> {
    return this.participantService.findUsersInGroup(groupId);
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
  @Get('group/:groupId')
  findOne(
    @User('id') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<Participant> {
    return this.participantService.findOne(userId, groupId);
  }

  @HttpCode(201)
  @Patch('group/:groupId')
  update(
    @User('id') userId: string,
    @Param('groupId') groupId: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.update(
      userId,
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
