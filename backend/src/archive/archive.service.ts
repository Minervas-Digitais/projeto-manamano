import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArchiveEntity } from './entity/archive.entity';

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) {}

  async createArchive(data: {
    name: string;
    mimeType: string;
    contentBase64: string;
    userId?: string | null;
    groupId?: string | null;
  }): Promise<ArchiveEntity> {
    const createdArchive = await this.prisma.archive.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        contentBase64: data.contentBase64,
        userId: data.userId || null,
        groupId: data.groupId || null,
      },
    });
    return new ArchiveEntity(createdArchive);
  }

  async getArchiveById(id: string): Promise<ArchiveEntity> {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      throw new NotFoundException('Archive not found');
    }

    return new ArchiveEntity(archive);
  }
}