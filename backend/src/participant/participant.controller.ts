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
import { GroupWithDetails, ParticipantService, UserInGroup } from './participant.service';
import { Participant } from '@prisma/client';
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(JwtAuthGuard)
  joinGroup(
    @Body() createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.joinGroupWithInvite(createParticipantDto);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<Participant[]> {
    return this.participantService.findAll();
  }

  @HttpCode(200)
  @Get('group/:groupId')
  @UseGuards(JwtAuthGuard)
  findUsersInGroup(@Param('groupId') groupId: string): Promise<UserInGroup[]> {
    return this.participantService.findUsersInGroup(groupId);
  }

  @HttpCode(200)
  @Get('groups/:id')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  findUserGroups(@Param('id') id: string): Promise<GroupWithDetails[]> {
    return this.participantService.findUserGroups(id);
  }

  @HttpCode(200)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<Participant> {
    return this.participantService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  update(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.update(id, updateParticipantDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.participantService.remove(id);
  }
}
