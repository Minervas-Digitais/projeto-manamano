import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) {}

  async createArchive(data: CreateArchiveDto): Promise<ResponseArchiveDto> {
    const createdArchive = await this.prisma.archive.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        contentBase64: data.contentBase64,
        userId: data.userId ? String(data.userId) : null,  // Convertendo número para string
        groupId: data.groupId ? String(data.groupId) : null, // Convertendo número para string

      },
    });

    return this.mapToResponseDto(createdArchive);
  }

  async getArchiveById(id: string): Promise<ResponseArchiveDto> {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      throw new NotFoundException('Archive not found');
    }

    return this.mapToResponseDto(archive);
  }

  private mapToResponseDto(archive: any): ResponseArchiveDto {
    return {
      id: archive.id,
      name: archive.name,
      mimeType: archive.mimeType,
      type: archive.type,
      userId: archive.userId ? Number(archive.userId) : undefined, // Convertendo string para número
      groupId: archive.groupId ? Number(archive.groupId) : undefined, // Convertendo string para número

    };
  }
}

