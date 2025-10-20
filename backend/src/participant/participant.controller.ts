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
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import {
  GroupWithDetails,
  ParticipantService,
  UserInGroup,
} from './participant.service';
import { Participant } from '@prisma/client';
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';

@Controller('participant')
@UseGuards(JwtAuthGuard)
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(MatchUserIdGuard)
  joinGroup(
    @Body() createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.joinGroupWithInvite(createParticipantDto);
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
  @Get('groups/:id')
  @UseGuards(MatchUserIdGuard)
  findUserGroups(@Param('id') id: string): Promise<GroupWithDetails[]> {
    return this.participantService.findUserGroups(id);
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Participant> {
    return this.participantService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(MatchUserIdGuard)
  update(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.update(id, updateParticipantDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(MatchUserIdGuard)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.participantService.remove(id);
  }
}
